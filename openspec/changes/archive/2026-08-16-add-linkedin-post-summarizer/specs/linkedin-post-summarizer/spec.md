## Purpose

Turns a LinkedIn post URL into a short summary and stores that data for later retrieval.

## ADDED Requirements

### Requirement: Accept a LinkedIn post URL for summarization

The system SHALL expose an API endpoint that accepts a single LinkedIn post URL as input and SHALL reject requests where the input is missing or is not a syntactically valid LinkedIn post URL, without attempting to fetch it.

#### Scenario: Valid LinkedIn post URL submitted

- **WHEN** a caller submits a request with a well-formed LinkedIn post URL
- **THEN** the system accepts the request and proceeds to fetch and process the post

#### Scenario: Missing URL

- **WHEN** a caller submits a request without a URL
- **THEN** the system responds with a client error and does not attempt any fetch

#### Scenario: Non-LinkedIn or malformed URL

- **WHEN** a caller submits a URL that is not a valid LinkedIn post URL (e.g. a different domain, or an unparsable string)
- **THEN** the system responds with a client error and does not attempt any fetch

### Requirement: Retrieve and extract post content

The system SHALL fetch the HTML at the given URL and SHALL extract the post's text content from it. If the fetched page does not contain extractable post content (e.g. the request was blocked or redirected to a login page), the system SHALL respond with an error indicating the content could not be retrieved, and SHALL NOT proceed to summarization or persistence.

#### Scenario: Post content successfully retrieved

- **WHEN** the fetch succeeds and the response contains a recognizable post body
- **THEN** the system extracts the post text and proceeds to summarization

#### Scenario: Content cannot be retrieved

- **WHEN** the fetch fails, times out, or returns a page without extractable post content (e.g. a login wall)
- **THEN** the system responds with an error describing that the post content could not be retrieved and does not call the summarization step or write to the database

### Requirement: Summarize post content

The system SHALL produce a summary of the extracted post text that is no longer than 5 sentences.

#### Scenario: Summary generated within limit

- **WHEN** post text is successfully extracted
- **THEN** the system produces a summary of at most 5 sentences that reflects the content of the post

### Requirement: Persist summary

The system SHALL persist the post URL and the generated summary to the database after it is successfully produced. Persistence failure SHALL be surfaced as an error in the API response.

#### Scenario: Successful persistence

- **WHEN** the summary is successfully generated
- **THEN** the system stores the URL and summary as a new record in the database

#### Scenario: Persistence fails

- **WHEN** the summary is generated but the database write fails
- **THEN** the system responds with an error indicating the result was not saved

### Requirement: Return structured result

The system SHALL return the summary in the API response when processing succeeds.

#### Scenario: Successful end-to-end response

- **WHEN** a valid LinkedIn post URL is processed successfully end-to-end
- **THEN** the API response includes the summary
