import { defineStore } from 'pinia'
import type { IZoomSignature } from './SessionModels';

const ZOOM_SIGNATURE_STORAGE_KEY = 'zoomsignature';

export const useSessionStore = defineStore('session', () => {
  function setZoomSignature(sdkKey: string, signature: string): void {
    const value: IZoomSignature = {
      sdkKey: sdkKey,
      signature: signature,
    };
    localStorage.setItem(ZOOM_SIGNATURE_STORAGE_KEY, JSON.stringify(value));
  }

  function getZoomSignature(): IZoomSignature {
    const localVal = localStorage.getItem(ZOOM_SIGNATURE_STORAGE_KEY)

    if (localVal === null) {
      throw Error('Zoom signature not set');
    } else {
      return JSON.parse(localVal) as IZoomSignature;
    }
  }
  function removeZoomSignature(): void {
    localStorage.removeItem(ZOOM_SIGNATURE_STORAGE_KEY);
  }
  return {
    setZoomSignature,
    getZoomSignature,
    removeZoomSignature,
  };
});
