
import { Decorator } from './Wrapping';

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export interface AnnotationsRegistry {
  register: (name: string, settings: AnnotatorSettings) => void;
  lookup: (name: string) => (AnnotatorSettings) | null;
  getNames: () => string[];
}

interface Annotation {
  readonly name: string;
  readonly settings: AnnotatorSettings;
}

const create = (): AnnotationsRegistry => {
  const annotations: Record<string, Annotation> = { };

  const register = (name: string, settings: AnnotatorSettings): void => {
    annotations[name] = {
      name,
      settings
    };
  };

  const lookup = (name: string): (AnnotatorSettings) | null => {
    const a = (annotations)[name] ?? null;
    return a !== null ? a.settings : null;
  };

  const getNames = (): string[] => Object.keys(annotations);

  return {
    register,
    lookup,
    getNames
  };
};

export {
  create
};
