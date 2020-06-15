import React, { useContext } from 'react';
import { RenderAuthorCallback } from '..';

const RenderAuthorContext = React.createContext<
  RenderAuthorCallback | undefined
>(undefined);

export const RenderAuthorProvider = RenderAuthorContext.Provider;

export const useRenderAuthorCallback = () => useContext(RenderAuthorContext);
