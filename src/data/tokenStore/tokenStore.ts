import { Observable } from "rx-lite";

export interface TokenStore {
    // List all entries in the store for our project
    list(): Observable<TokenEntry>;

    // Get a specific token
    get(key: TokenKeyType): Promise<TokenEntry | null>;

    // Add or update a token
    set(key: TokenKeyType, token: TokenValueType): Promise<void>;

    // Remove a token
    remove(key: TokenKeyType): Promise<void> ;
  }

// Information stored about in each token
export interface TokenEntry {
    key: TokenKeyType;
    accessToken: TokenValueType;
}

export interface TokenValueType {
    id?: string;
    token: string;
}

//
// Object used as token keys.
// Right now just a string, prepping for when we hook up to
// AAD and have to use ADAL tokens.
//
export type TokenKeyType = string;
