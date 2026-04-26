import { Future } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { HasLayoutAnchor, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';
import { ToolbarSpec } from './ToolbarTypes';

export interface FloatingToolbarButtonDetail extends CompositeSketchDetail, HasLayoutAnchor {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;
  getBounds: (() => Bounds) | null;
  fireDismissalEventInstead: ({
    event: string;
  }) | null;

  markers: {
    toggledClass: string;
  };

  onToggled: (comp: AlloyComponent, state: boolean) => void;
}

export interface FloatingToolbarButtonApis {
  setGroups: (floatingToolbarButton: AlloyComponent, groups: AlloySpec[]) => (AlloyComponent) | null;
  reposition: (floatingToolbarButton: AlloyComponent) => void;
  toggle: (floatingToolbarButton: AlloyComponent) => void;
  toggleWithoutFocusing: (floatingToolbarButton: AlloyComponent) => void;
  getToolbar: (floatingToolbarButton: AlloyComponent) => (AlloyComponent) | null;
  isOpen: (floatingToolbarButton: AlloyComponent) => boolean;
}

export interface FloatingToolbarButtonSpec extends CompositeSketchSpec, HasLayoutAnchorSpec {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;
  getBounds?: () => Bounds;
  fireDismissalEventInstead?: {
    event?: string;
  };

  markers: {
    toggledClass: string;
  };

  parts: {
    'button': Partial<SimpleOrSketchSpec>;
    'toolbar': Partial<ToolbarSpec>;
  };

  onToggled?: (comp: AlloyComponent, state: boolean) => void;
}

export interface FloatingToolbarButtonSketcher extends CompositeSketch<FloatingToolbarButtonSpec>, FloatingToolbarButtonApis { }
