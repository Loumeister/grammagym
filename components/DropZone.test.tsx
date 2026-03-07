import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SentenceChunk } from './DropZone';
import type { Token, RoleDefinition } from '../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeToken(id: string, text: string): Token {
  return { id, text, role: 'ow' };
}

function makeRole(key: RoleDefinition['key'], label: string): RoleDefinition {
  return {
    key,
    label,
    shortLabel: label.slice(0, 2).toUpperCase(),
    colorClass: 'text-blue-700 bg-blue-100',
    borderColorClass: 'border-blue-400',
  };
}

const ROLE_OW = makeRole('ow', 'Onderwerp');
const ROLE_PV = makeRole('pv', 'Persoonsvorm');
const ROLE_BIJZIN = makeRole('bijzin', 'Bijzin');
const ROLE_LV = makeRole('lv', 'Lijdend voorwerp');
const ROLE_BIJV_BEP = makeRole('bijv_bep', 'Bijv. bepaling');

const TWO_TOKENS: Token[] = [
  makeToken('t1', 'De'),
  makeToken('t2', 'kat'),
];
const THREE_TOKENS: Token[] = [
  makeToken('t1', 'De'),
  makeToken('t2', 'grote'),
  makeToken('t3', 'kat'),
];

// ─── Default props helper ────────────────────────────────────────────────────

function defaultProps(overrides: Partial<React.ComponentProps<typeof SentenceChunk>> = {}): React.ComponentProps<typeof SentenceChunk> {
  return {
    chunkIndex: 0,
    tokens: TWO_TOKENS,
    startIndex: 0,
    assignedRole: null,
    assignedBijzinFunctie: null,
    bijvBepTargetText: null,
    subRoles: {},
    onDropChunk: vi.fn(),
    onDropBijzinFunctie: vi.fn(),
    onDropWord: vi.fn(),
    onRemoveRole: vi.fn(),
    onRemoveBijzinFunctie: vi.fn(),
    onRemoveSubRole: vi.fn(),
    onToggleSplit: vi.fn(),
    onStartBijvBepLinking: vi.fn(),
    onRemoveBijvBepLink: vi.fn(),
    onWordClick: vi.fn(),
    hasBijzinFunctie: false,
    isLinkingMode: false,
    isLinkingSource: false,
    ...overrides,
  };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SentenceChunk – rendering', () => {
  it('renders all token texts', () => {
    render(<SentenceChunk {...defaultProps()} />);
    expect(screen.getByText('De')).toBeInTheDocument();
    expect(screen.getByText('kat')).toBeInTheDocument();
  });

  it('shows placeholder text when no role is assigned', () => {
    render(<SentenceChunk {...defaultProps()} />);
    expect(screen.getByText('Sleep zinsdeel hier')).toBeInTheDocument();
  });

  it('shows the role label when a role is assigned', () => {
    render(<SentenceChunk {...defaultProps({ assignedRole: ROLE_OW })} />);
    expect(screen.getByText('Onderwerp')).toBeInTheDocument();
    expect(screen.queryByText('Sleep zinsdeel hier')).not.toBeInTheDocument();
  });

  it('renders a splitter between consecutive tokens', () => {
    render(<SentenceChunk {...defaultProps({ tokens: THREE_TOKENS })} />);
    // 3 tokens → 2 splitters (positioned between t1-t2 and t2-t3)
    const splitters = document.querySelectorAll('[title="Splits hier"]');
    expect(splitters).toHaveLength(2);
  });

  it('does not render a splitter for a single-token chunk', () => {
    render(<SentenceChunk {...defaultProps({ tokens: [makeToken('t1', 'slaapt')] })} />);
    expect(document.querySelectorAll('[title="Splits hier"]')).toHaveLength(0);
  });
});

// ─── Validation states ────────────────────────────────────────────────────────

describe('SentenceChunk – validation states', () => {
  it('shows ✓ icon when state is correct', () => {
    render(<SentenceChunk {...defaultProps({ validationState: 'correct' })} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows ! icon when state is warning', () => {
    render(<SentenceChunk {...defaultProps({ validationState: 'warning' })} />);
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('shows × icon when state is incorrect-role', () => {
    render(<SentenceChunk {...defaultProps({ validationState: 'incorrect-role' })} />);
    // The × used for status icon
    const icons = screen.getAllByText('×');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows ✂ icon when state is incorrect-split', () => {
    render(<SentenceChunk {...defaultProps({ validationState: 'incorrect-split' })} />);
    expect(screen.getByText('✂')).toBeInTheDocument();
  });

  it('shows "Foutieve splitsing" label when state is incorrect-split', () => {
    render(<SentenceChunk {...defaultProps({ validationState: 'incorrect-split' })} />);
    expect(screen.getByText('Foutieve splitsing')).toBeInTheDocument();
  });

  it('shows no status icon when state is null', () => {
    render(<SentenceChunk {...defaultProps({ validationState: null })} />);
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
    expect(screen.queryByText('✂')).not.toBeInTheDocument();
    expect(screen.queryByText('!')).not.toBeInTheDocument();
  });
});

// ─── Feedback tooltip ─────────────────────────────────────────────────────────

describe('SentenceChunk – feedback tooltip', () => {
  it('shows feedback message when provided', () => {
    render(<SentenceChunk {...defaultProps({ feedbackMessage: 'Dit is een onderwerp' })} />);
    expect(screen.getByText('Dit is een onderwerp')).toBeInTheDocument();
  });

  it('does not show tooltip when feedbackMessage is null', () => {
    render(<SentenceChunk {...defaultProps({ feedbackMessage: null })} />);
    expect(screen.queryByText('Dit is een onderwerp')).not.toBeInTheDocument();
  });

  it('dismisses the tooltip when × button is clicked', async () => {
    render(<SentenceChunk {...defaultProps({ feedbackMessage: 'Fout antwoord' })} />);
    const dismissBtn = screen.getByTitle('Verbergen');
    await userEvent.click(dismissBtn);
    expect(screen.queryByText('Fout antwoord')).not.toBeInTheDocument();
  });

  it('re-shows tooltip when feedbackMessage prop changes after dismiss', async () => {
    const { rerender, props } = (() => {
      const p = defaultProps({ feedbackMessage: 'Eerste bericht' });
      const utils = render(<SentenceChunk {...p} />);
      return { rerender: utils.rerender, props: p };
    })();
    // Dismiss
    await userEvent.click(screen.getByTitle('Verbergen'));
    expect(screen.queryByText('Eerste bericht')).not.toBeInTheDocument();
    // New message → should re-appear
    rerender(<SentenceChunk {...props} feedbackMessage="Nieuw bericht" />);
    expect(screen.getByText('Nieuw bericht')).toBeInTheDocument();
  });
});

// ─── Role removal ────────────────────────────────────────────────────────────

describe('SentenceChunk – role removal', () => {
  it('calls onRemoveRole with chunkId when role header is clicked', async () => {
    const onRemoveRole = vi.fn();
    render(<SentenceChunk {...defaultProps({ assignedRole: ROLE_OW, onRemoveRole })} />);
    // Click on the role label text
    await userEvent.click(screen.getByText('Onderwerp'));
    expect(onRemoveRole).toHaveBeenCalledWith('t1'); // chunkId = first token id
  });

  it('does not call onRemoveRole when clicking placeholder (no role assigned)', async () => {
    const onRemoveRole = vi.fn();
    render(<SentenceChunk {...defaultProps({ onRemoveRole })} />);
    await userEvent.click(screen.getByText('Sleep zinsdeel hier'));
    expect(onRemoveRole).not.toHaveBeenCalled();
  });
});

// ─── Drop behaviour ───────────────────────────────────────────────────────────

describe('SentenceChunk – drop on chunk', () => {
  it('calls onDropChunk with chunkId when a role is dropped', () => {
    const onDropChunk = vi.fn();
    const { container } = render(<SentenceChunk {...defaultProps({ onDropChunk })} />);
    const chunkDiv = container.firstChild as HTMLElement;

    fireEvent.drop(chunkDiv, {
      dataTransfer: { getData: vi.fn(() => 'ow'), setData: vi.fn(), effectAllowed: '' },
    });
    expect(onDropChunk).toHaveBeenCalledWith(expect.any(Object), 't1');
  });

  it('calls onDropWord with tokenId when a role is dropped onto a word', () => {
    const onDropWord = vi.fn();
    render(<SentenceChunk {...defaultProps({ onDropWord })} />);
    const wordSpan = screen.getByText('De');

    fireEvent.drop(wordSpan, {
      dataTransfer: { getData: vi.fn(() => 'bijv_bep'), setData: vi.fn(), effectAllowed: '' },
    });
    expect(onDropWord).toHaveBeenCalledWith(expect.any(Object), 't1');
  });
});

// ─── Splitter / toggleSplit ───────────────────────────────────────────────────

describe('SentenceChunk – splitter', () => {
  it('calls onToggleSplit with correct global index when splitter is clicked', async () => {
    const onToggleSplit = vi.fn();
    // startIndex=3, tokens=[t1,t2,t3] → splitter between i=0 and i=1 → global index 3+0=3
    render(<SentenceChunk {...defaultProps({ tokens: THREE_TOKENS, startIndex: 3, onToggleSplit })} />);
    const splitters = document.querySelectorAll('[title="Splits hier"]');
    await userEvent.click(splitters[0]);
    expect(onToggleSplit).toHaveBeenCalledWith(3);
  });

  it('calls onToggleSplit with next global index for second splitter', async () => {
    const onToggleSplit = vi.fn();
    render(<SentenceChunk {...defaultProps({ tokens: THREE_TOKENS, startIndex: 0, onToggleSplit })} />);
    const splitters = document.querySelectorAll('[title="Splits hier"]');
    await userEvent.click(splitters[1]);
    expect(onToggleSplit).toHaveBeenCalledWith(1);
  });
});

// ─── Sub-role chips ───────────────────────────────────────────────────────────

describe('SentenceChunk – sub-role chips', () => {
  it('renders a sub-role chip above the correct token', () => {
    const subRoles = { t1: ROLE_BIJV_BEP };
    render(<SentenceChunk {...defaultProps({ subRoles })} />);
    expect(screen.getByTitle('Klik om te verwijderen')).toBeInTheDocument();
    expect(screen.getByText(ROLE_BIJV_BEP.shortLabel)).toBeInTheDocument();
  });

  it('calls onRemoveSubRole when a sub-role chip is clicked', async () => {
    const onRemoveSubRole = vi.fn();
    const subRoles = { t1: ROLE_BIJV_BEP };
    render(<SentenceChunk {...defaultProps({ subRoles, onRemoveSubRole })} />);
    await userEvent.click(screen.getByTitle('Klik om te verwijderen'));
    expect(onRemoveSubRole).toHaveBeenCalledWith('t1');
  });
});

// ─── Bijzin function row ──────────────────────────────────────────────────────

describe('SentenceChunk – bijzin function row', () => {
  it('does not show bijzin function row when hasBijzinFunctie is false', () => {
    render(<SentenceChunk {...defaultProps({ hasBijzinFunctie: false, assignedRole: ROLE_BIJZIN })} />);
    expect(screen.queryByText(/Sleep functie hier/)).not.toBeInTheDocument();
  });

  it('does not show bijzin function row when chunk is not labeled as bijzin', () => {
    render(<SentenceChunk {...defaultProps({ hasBijzinFunctie: true, assignedRole: ROLE_OW })} />);
    expect(screen.queryByText(/Sleep functie hier/)).not.toBeInTheDocument();
  });

  it('shows the bijzin function drop zone when hasBijzinFunctie=true and role=bijzin', () => {
    render(<SentenceChunk {...defaultProps({ hasBijzinFunctie: true, assignedRole: ROLE_BIJZIN })} />);
    expect(screen.getByText(/Sleep functie hier/)).toBeInTheDocument();
  });

  it('shows assigned bijzin function label when one is set', () => {
    render(<SentenceChunk {...defaultProps({
      hasBijzinFunctie: true,
      assignedRole: ROLE_BIJZIN,
      assignedBijzinFunctie: ROLE_LV,
    })} />);
    expect(screen.getByText('functie:')).toBeInTheDocument();
    expect(screen.getByText('Lijdend voorwerp')).toBeInTheDocument();
  });

  it('calls onRemoveBijzinFunctie when assigned function label is clicked', async () => {
    const onRemoveBijzinFunctie = vi.fn();
    render(<SentenceChunk {...defaultProps({
      hasBijzinFunctie: true,
      assignedRole: ROLE_BIJZIN,
      assignedBijzinFunctie: ROLE_LV,
      onRemoveBijzinFunctie,
    })} />);
    await userEvent.click(screen.getByText('Lijdend voorwerp'));
    expect(onRemoveBijzinFunctie).toHaveBeenCalledWith('t1');
  });

  it('calls onDropBijzinFunctie when a role is dropped on the bijzin function row', () => {
    const onDropBijzinFunctie = vi.fn();
    render(<SentenceChunk {...defaultProps({
      hasBijzinFunctie: true,
      assignedRole: ROLE_BIJZIN,
      onDropBijzinFunctie,
    })} />);
    const functieZone = screen.getByText(/Sleep functie hier/).closest('div')!;
    fireEvent.drop(functieZone, {
      dataTransfer: { getData: vi.fn(() => 'lv'), setData: vi.fn(), effectAllowed: '' },
    });
    expect(onDropBijzinFunctie).toHaveBeenCalledWith(expect.any(Object), 't1');
  });
});

// ─── Bijv Bep linking row ─────────────────────────────────────────────────────

describe('SentenceChunk – bijv bep linking', () => {
  const bijvBepBase = {
    hasBijzinFunctie: true,
    assignedRole: ROLE_BIJZIN,
    assignedBijzinFunctie: ROLE_BIJV_BEP,
  };

  it('shows "Wijs het woord aan" button when no target is set', () => {
    render(<SentenceChunk {...defaultProps(bijvBepBase)} />);
    expect(screen.getByText(/Wijs het woord aan/)).toBeInTheDocument();
  });

  it('calls onStartBijvBepLinking when the link button is clicked', async () => {
    const onStartBijvBepLinking = vi.fn();
    render(<SentenceChunk {...defaultProps({ ...bijvBepBase, onStartBijvBepLinking })} />);
    await userEvent.click(screen.getByText(/Wijs het woord aan/));
    expect(onStartBijvBepLinking).toHaveBeenCalledWith('t1');
  });

  it('shows the animated prompt when isLinkingSource is true', () => {
    render(<SentenceChunk {...defaultProps({ ...bijvBepBase, isLinkingSource: true })} />);
    expect(screen.getByText(/Klik op het woord/)).toBeInTheDocument();
  });

  it('shows "hoort bij: X" when bijvBepTargetText is provided', () => {
    render(<SentenceChunk {...defaultProps({ ...bijvBepBase, bijvBepTargetText: 'kat' })} />);
    expect(screen.getByText("'kat'")).toBeInTheDocument();
    expect(screen.getByText('hoort bij:')).toBeInTheDocument();
  });

  it('calls onRemoveBijvBepLink when the unlink button is clicked', async () => {
    const onRemoveBijvBepLink = vi.fn();
    render(<SentenceChunk {...defaultProps({ ...bijvBepBase, bijvBepTargetText: 'kat', onRemoveBijvBepLink })} />);
    await userEvent.click(screen.getByTitle('Verwijder verwijzing'));
    expect(onRemoveBijvBepLink).toHaveBeenCalledWith('t1');
  });
});

// ─── Word linking mode ────────────────────────────────────────────────────────

describe('SentenceChunk – word linking mode', () => {
  it('calls onWordClick when a word is clicked in linking mode', async () => {
    const onWordClick = vi.fn();
    render(<SentenceChunk {...defaultProps({ isLinkingMode: true, isLinkingSource: false, onWordClick })} />);
    await userEvent.click(screen.getByText('De'));
    expect(onWordClick).toHaveBeenCalledWith('t1');
  });

  it('does not call onWordClick when not in linking mode', async () => {
    const onWordClick = vi.fn();
    render(<SentenceChunk {...defaultProps({ isLinkingMode: false, onWordClick })} />);
    await userEvent.click(screen.getByText('De'));
    expect(onWordClick).not.toHaveBeenCalled();
  });

  it('does not call onWordClick when this chunk is the linking source', async () => {
    const onWordClick = vi.fn();
    render(<SentenceChunk {...defaultProps({ isLinkingMode: true, isLinkingSource: true, onWordClick })} />);
    await userEvent.click(screen.getByText('De'));
    expect(onWordClick).not.toHaveBeenCalled();
  });
});
