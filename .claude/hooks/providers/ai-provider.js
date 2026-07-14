/**
 * AI Provider Abstraction Layer
 *
 * Defines the interface that all AI providers must implement.
 * Hooks own prompt engineering; providers just send text and return text.
 * The hook code handles JSON parsing via parse-llm-json.ts.
 */
export const EMPTY_CLASSIFICATION = {
    mandatory: [],
    recommended: [],
};
export const EMPTY_ANALYSIS = {
    skills: [],
};
