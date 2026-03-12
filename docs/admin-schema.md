# Admin schema reference (confirmed)

This document is the **source of truth for the admin UI**. It is derived from Supabase `information_schema.columns` and `information_schema.table_constraints` output pasted from the Supabase SQL editor.

**Rules**
- Use **only** these confirmed columns in `select()`, `order()`, tables, and forms.
- Do **not** guess columns.
- Do **not** change Supabase RLS policies.

## Tables (confirmed columns)

### `profiles` (read-only)
- `id` uuid (NOT NULL)
- `created_datetime_utc` timestamptz (NULL, default `now()`)
- `modified_datetime_utc` timestamptz (NULL)
- `first_name` varchar (NULL)
- `last_name` varchar (NULL)
- `email` text (NULL)
- `is_superadmin` boolean (NOT NULL, default `false`)
- `is_in_study` boolean (NOT NULL, default `false`)
- `is_matrix_admin` boolean (NOT NULL, default `false`)

### `images` (CRUD)
- `id` uuid (NOT NULL, default `gen_random_uuid()`)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `modified_datetime_utc` timestamptz (NULL)
- `url` varchar (NULL)
- `is_common_use` boolean (NULL, default `false`)
- `profile_id` uuid (NULL, default `auth.uid()`)
- `additional_context` varchar (NULL)
- `is_public` boolean (NULL, default `false`)
- `image_description` text (NULL)
- `celebrity_recognition` text (NULL)
- `embedding` USER-DEFINED (NULL) — **do not expose/edit in admin UI**

### `captions` (read-only)
- `id` uuid (NOT NULL, default `gen_random_uuid()`)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `modified_datetime_utc` timestamptz (NULL)
- `content` varchar (NULL)
- `is_public` boolean (NOT NULL)
- `profile_id` uuid (NOT NULL)
- `image_id` uuid (NOT NULL)
- `humor_flavor_id` bigint (NULL)
- `is_featured` boolean (NOT NULL, default `false`)
- `caption_request_id` bigint (NULL)
- `like_count` bigint (NOT NULL, default `0`)
- `llm_prompt_chain_id` bigint (NULL)

### `caption_requests` (read-only)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `profile_id` uuid (NOT NULL)
- `image_id` uuid (NOT NULL)

### `llm_prompt_chains` (read-only)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `caption_request_id` bigint (NOT NULL)

### `humor_flavors` (read-only)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `description` text (NULL)
- `slug` varchar (NOT NULL)

### `humor_flavor_steps` (read-only)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `humor_flavor_id` bigint (NOT NULL)
- `llm_temperature` numeric (NULL)
- `order_by` smallint (NOT NULL)
- `llm_input_type_id` smallint (NOT NULL)
- `llm_output_type_id` smallint (NOT NULL)
- `llm_model_id` smallint (NOT NULL)
- `humor_flavor_step_type_id` smallint (NOT NULL)
- `llm_system_prompt` text (NULL)
- `llm_user_prompt` text (NULL)
- `description` varchar (NULL)

### `humor_flavor_step_types` (supporting table; read-only if needed)
- `id` smallint (NOT NULL)
- `created_at` timestamptz (NOT NULL, default `now()`)
- `slug` varchar (NOT NULL)
- `description` text (NOT NULL)

### `llm_input_types` (supporting table; read-only if needed)
- `id` smallint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `description` varchar (NOT NULL)
- `slug` varchar (NOT NULL)

### `llm_output_types` (supporting table; read-only if needed)
- `id` smallint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `description` varchar (NOT NULL)
- `slug` varchar (NOT NULL)

### `llm_providers` (CRUD)
- `id` smallint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `name` varchar (NOT NULL)

### `llm_models` (CRUD)
- `id` smallint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `name` varchar (NOT NULL)
- `llm_provider_id` smallint (NOT NULL)
- `provider_model_id` varchar (NOT NULL)
- `is_temperature_supported` boolean (NOT NULL, default `false`)

### `terms` (CRUD)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `modified_datetime_utc` timestamp (without time zone) (NULL)
- `term` varchar (NOT NULL)
- `definition` text (NOT NULL)
- `example` text (NOT NULL)
- `priority` smallint (NOT NULL, default `0`)
- `term_type_id` smallint (NULL)

### `term_types` (supporting table; FK target)
- `id` smallint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `name` varchar (NOT NULL)

### `caption_examples` (CRUD)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `modified_datetime_utc` timestamptz (NULL)
- `image_description` text (NOT NULL)
- `caption` text (NOT NULL)
- `explanation` text (NOT NULL)
- `priority` smallint (NOT NULL, default `0`)
- `image_id` uuid (NULL)

### `allowed_signup_domains` (CRUD)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `apex_domain` varchar (NOT NULL)

### `humor_flavor_mix` (read + update)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `humor_flavor_id` bigint (NOT NULL)
- `caption_count` smallint (NOT NULL)

### `llm_model_responses` (read-only)
- `id` uuid (NOT NULL, default `gen_random_uuid()`)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `llm_model_response` text (NULL)
- `processing_time_seconds` smallint (NOT NULL)
- `llm_model_id` smallint (NOT NULL)
- `profile_id` uuid (NOT NULL)
- `caption_request_id` bigint (NOT NULL)
- `llm_system_prompt` text (NOT NULL)
- `llm_user_prompt` text (NOT NULL)
- `llm_temperature` numeric (NULL)
- `humor_flavor_id` bigint (NOT NULL)
- `llm_prompt_chain_id` bigint (NULL)
- `humor_flavor_step_id` bigint (NULL)

### `whitelist_email_addresses` (CRUD)
- `id` bigint (NOT NULL)
- `created_datetime_utc` timestamptz (NOT NULL, default `now()`)
- `modified_datetime_utc` timestamptz (NULL)
- `email_address` varchar (NOT NULL)

## Relationships (confirmed foreign keys)
- `images.profile_id` → `profiles.id`
- `captions.profile_id` → `profiles.id`
- `captions.image_id` → `images.id`
- `captions.humor_flavor_id` → `humor_flavors.id`
- `captions.caption_request_id` → `caption_requests.id`
- `captions.llm_prompt_chain_id` → `llm_prompt_chains.id`
- `caption_requests.profile_id` → `profiles.id`
- `caption_requests.image_id` → `images.id`
- `caption_examples.image_id` → `images.id`
- `llm_prompt_chains.caption_request_id` → `caption_requests.id`
- `llm_models.llm_provider_id` → `llm_providers.id`
- `humor_flavor_steps.humor_flavor_id` → `humor_flavors.id`
- `humor_flavor_steps.humor_flavor_step_type_id` → `humor_flavor_step_types.id`
- `humor_flavor_steps.llm_input_type_id` → `llm_input_types.id`
- `humor_flavor_steps.llm_output_type_id` → `llm_output_types.id`
- `humor_flavor_steps.llm_model_id` → `llm_models.id`
- `terms.term_type_id` → `term_types.id`

