import type { ComputedRef, InjectionKey } from 'vue';
export interface ImageColorPicking {
  available: ComputedRef<boolean>;
  request: (receive: (color:string) => void) => void;
}
export const imageColorPickingKey: InjectionKey<ImageColorPicking> = Symbol('image-color-picking');
