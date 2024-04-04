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
import { ActiveIssuer } from "./activeIssuer.ts";
import { createJSONStorage, persist } from "zustand/middleware";
import useActiveAccount from "./account.ts";

export interface Store {
  issuers: Map<string, ActiveIssuer[]>;

  // setIssuers(issuers: StableCoinIssuer[]): void;

  addIssuer(accountPk: string, issuer: ActiveIssuer): void;

  getIssuers(): ActiveIssuer[];
}

const useIssuers = create<Store>()(persist<Store>((set) => ({
  issuers: new Map(),
  // setIssuers(issuers) {
  //   set({ issuers });
  // },

  getIssuers() {
    const { account } = useActiveAccount.getState?.() || { account: null };
    if (!account) {
      throw new Error("No active account");
    }
    return this.issuers[account.public_key] || [];
  },
  addIssuer(accountPk, issuer) {
    set((state) => {
      if (!state.issuers[accountPk]) {
        state.issuers[accountPk] = [];
      }
      state.issuers[accountPk].push(issuer);
      return state;
    });
  },
}), {
  name: "issuers",
  storage: createJSONStorage(() => localStorage),
}));

export default useIssuers;
