//  Copyright 2022. The Tari Project
//
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
//  following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//  disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//  following disclaimer in the documentation and/or other materials provided with the distribution.
//
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
//  products derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
//  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
//  USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { create } from "zustand";
import { providers } from "@tariproject/tarijs";
import TariWallet from "../wallet.ts";
import { ResourceAddress, VaultId } from "../../../../../dan/bindings";

export interface ActiveIssuer {
  id: string;
  version: number;
  vault: {
    id: string;
    resourceAddress: string;
    revealedAmount: number;
  };
  wrappedToken: WrappedExchangeToken | null;
  adminAuthResource: string;
  userAuthResource: string;
}

export interface WrappedExchangeToken {
  vault: VaultId;
  resource: ResourceAddress;
  balance: number;
  exchange_fee: ExchangeFee;
}

export type ExchangeFee = { Fixed: number } | { Percentage: number };

export interface Store {
  activeIssuer: ActiveIssuer | null;

  setActiveIssuer(issuer: ActiveIssuer | null);

  clearActiveIssuer();
}

const useActiveIssuer = create<Store>()((set) => ({
  activeIssuer: null,
  setActiveIssuer(activeIssuer) {
    set({ activeIssuer });
  },
  clearActiveIssuer() {
    set({ activeIssuer: null });
  },
}));

export default useActiveIssuer;
