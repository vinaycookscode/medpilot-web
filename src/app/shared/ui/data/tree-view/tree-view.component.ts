import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface GwTreeNode {
  key: string;
  label: string;
  icon?: string;
  children?: GwTreeNode[];
  /** Initial expansion state. */
  expanded?: boolean;
  disabled?: boolean;
  meta?: string | number;
}

@Component({
  selector: 'gw-tree-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-tree-host' },
})
export class GwTreeViewComponent {
  @Input({ required: true }) nodes: GwTreeNode[] = [];
  @Input() selectedKey: string | null = null;
  @Output() selectionChange = new EventEmitter<string>();
  @Output() expandChange = new EventEmitter<{ node: GwTreeNode; expanded: boolean }>();

  readonly expandedSet = signal<Set<string>>(new Set());

  ngOnInit() {
    const init = new Set<string>();
    const walk = (n: GwTreeNode) => {
      if (n.expanded) init.add(n.key);
      n.children?.forEach(walk);
    };
    this.nodes.forEach(walk);
    this.expandedSet.set(init);
  }

  isExpanded(node: GwTreeNode): boolean { return this.expandedSet().has(node.key); }
  isSelected(node: GwTreeNode): boolean { return node.key === this.selectedKey; }

  toggle(node: GwTreeNode) {
    if (!node.children?.length) {
      this.selectionChange.emit(node.key);
      return;
    }
    const next = new Set(this.expandedSet());
    const willOpen = !next.has(node.key);
    if (willOpen) next.add(node.key); else next.delete(node.key);
    this.expandedSet.set(next);
    this.expandChange.emit({ node, expanded: willOpen });
  }

  select(node: GwTreeNode) {
    if (node.disabled) return;
    this.selectionChange.emit(node.key);
  }
}
