# generate-engagement-post Specification

## Purpose

Turns the summaries of posts a user has liked (for topic ideas) and the user's own past posts (for tone and writing style) into a new, French, engagement-oriented LinkedIn post that positions them as an attractive software engineer freelancer to recruiters, and saves the result.

## Requirements

### Requirement: Trigger post generation from the home page
The system SHALL provide a control on the home page that, when activated, starts generating a new post. While generation is in progress, the control SHALL indicate a loading state and SHALL NOT allow a second generation to be started concurrently.

#### Scenario: User activates the control
- **WHEN** the user activates the generation control
- **THEN** the system begins fetching context and shows a loading state

#### Scenario: Control activated while a generation is already in progress
- **WHEN** the user activates the control while a previous generation for that user is still running
- **THEN** the system does not start a second generation

### Requirement: Gather liked-post topic context
The system SHALL read all stored liked-post summaries to use as topic context for generation. If no liked-post summaries exist, the system SHALL NOT call the LLM and SHALL instead indicate that there is nothing to generate from.

#### Scenario: Liked posts exist
- **WHEN** generation is triggered and one or more liked-post summaries exist
- **THEN** the system includes their summaries as topic context for the LLM

#### Scenario: No liked posts exist
- **WHEN** generation is triggered and no liked-post summaries exist
- **THEN** the system responds with a message indicating there are no liked posts to generate from, and does not call the LLM

### Requirement: Gather personal-post style context
The system SHALL read the user's stored past posts to use as tone/style context for generation, when available. Personal posts are optional: if none exist, the system SHALL still proceed with generation using only the liked-post topic context, and this SHALL NOT be treated as an error.

#### Scenario: Personal posts exist
- **WHEN** generation is triggered and one or more personal posts exist
- **THEN** the system includes their content as tone/style context for the LLM

#### Scenario: No personal posts exist
- **WHEN** generation is triggered and no personal posts exist
- **THEN** the system proceeds with generation using only the liked-post topic context, without erroring

### Requirement: Generate a French, engagement-oriented post
Given the gathered context, the system SHALL produce a new LinkedIn post written in French. The generated post SHALL draw its topics from the liked-post context, SHALL reflect the tone and writing style of the personal-post context when available, and SHALL be written to be engaging and to position the user as an attractive software engineer freelancer to recruiters.

#### Scenario: Post generated from full context
- **WHEN** the LLM is called with both liked-post and personal-post context
- **THEN** the system produces a non-empty post written in French

#### Scenario: Post generated from topic context only
- **WHEN** the LLM is called with liked-post context and no personal-post context
- **THEN** the system produces a non-empty post written in French

#### Scenario: Generation fails
- **WHEN** the LLM call fails or returns an unusable result
- **THEN** the system responds with an error indicating generation failed, and does not attempt to save anything

### Requirement: Persist the generated post
The system SHALL save a successfully generated post before returning it to the user. Persistence failure SHALL be surfaced as an error distinct from a generation failure.

#### Scenario: Successful persistence
- **WHEN** a post is successfully generated
- **THEN** the system saves the generated post as a new record

#### Scenario: Persistence fails
- **WHEN** a post is successfully generated but saving it fails
- **THEN** the system responds with an error indicating the post was generated but not saved

### Requirement: Display the generated post
The system SHALL display the generated post on the home page once generation and saving succeed.

#### Scenario: Successful end-to-end generation
- **WHEN** generation and persistence both succeed
- **THEN** the home page displays the generated French post text to the user
