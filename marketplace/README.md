# hooks basics

### hook lifecycle overview

```mermaid
flowchart tb
    subgraph session["🟢 session lifecycle"]
        direction tb
        setup[["🔧 setup<br/>(init/maintenance)"]]
        start[["▶️ sessionstart<br/>(startup/resume/clear)"]]
        end[["⏹️ sessionend<br/>(exit/sigint/error)"]]
    end

    subgraph main["🔄 main conversation loop"]
        direction tb
        prompt[["📝 userpromptsubmit"]]
        claude["claude processes"]

        subgraph tools["🛠️ tool execution"]
            direction tb
            pre[["🔒 pretooluse"]]
            perm[["❓ permissionrequest"]]
            exec["tool executes"]
            post[["✅ posttooluse"]]
            fail[["❌ posttoolusefailure"]]
        end

        subgraph subagent["🤖 subagent lifecycle"]
            direction tb
            sstart[["🚀 subagentstart"]]
            swork["subagent works"]
            sstop[["🏁 subagentstop"]]
        end

        notify[["🔔 notification<br/>(async)"]]
        stop[["🛑 stop"]]
    end

    subgraph compact["🗜️ maintenance"]
        precompact[["📦 precompact"]]
    end

    setup --> start
    start --> prompt
    prompt --> claude
    claude --> pre
    pre --> perm
    perm --> exec
    exec --> post
    exec -.-> fail
    claude -.-> sstart
    sstart --> swork
    swork --> sstop
    post --> claude
    claude --> stop
    claude -.-> notify
    stop --> prompt
    stop -.-> end
    prompt -.-> precompact
    precompact -.-> prompt
```

### 1. userpromptsubmit hook

**fires:** immediately when user submits a prompt (before claude processes it)  
**payload:** `prompt` text, `session_id`, timestamp  
**enhanced:** prompt validation, logging, context injection, security filtering

### 2. pretooluse hook

**fires:** before any tool execution  
**payload:** `tool_name`, `tool_input` parameters  
**enhanced:** blocks dangerous commands (`rm -rf`, `.env` access)

### 3. posttooluse hook

**fires:** after successful tool completion  
**payload:** `tool_name`, `tool_input`, `tool_response` with results

### 4. notification hook

**fires:** when claude code sends notifications (waiting for input, etc.)  
**payload:** `message` content  
**enhanced:** tts alerts - "your agent needs your input" (30% chance includes name)

### 5. stop hook

**fires:** when claude code finishes responding  
**payload:** `stop_hook_active` boolean flag  
**enhanced:** ai-generated completion messages with tts playback (llm priority: openai > anthropic > ollama > random)

### 6. subagentstop hook

**fires:** when claude code subagents (task tools) finish responding  
**payload:** `stop_hook_active` boolean flag  
**enhanced:** tts playback - "subagent complete"

### 7. precompact hook

**fires:** before claude code performs a compaction operation  
**payload:** `trigger` ("manual" or "auto"), `custom_instructions` (for manual), session info  
**enhanced:** transcript backup, verbose feedback for manual compaction

### 8. sessionstart hook

**fires:** when claude code starts a new session or resumes an existing one
**payload:** `source` ("startup", "resume", or "clear"), session info
**enhanced:** development context loading (git status, recent issues, context files)

### 9. sessionend hook

**fires:** when claude code session ends (exit, sigint, or error)
**payload:** `session_id`, `transcript_path`, `cwd`, `permission_mode`, `reason`
**enhanced:** session logging with optional cleanup tasks (removes temp files, stale logs)

### 10. permissionrequest hook

**fires:** when user is shown a permission dialog
**payload:** `tool_name`, `tool_input`, `tool_use_id`, session info
**enhanced:** permission auditing, auto-allow for read-only ops (read, glob, grep, safe bash)

### 11. posttoolusefailure hook

**fires:** when a tool execution fails
**payload:** `tool_name`, `tool_input`, `tool_use_id`, `error` object
**enhanced:** structured error logging with timestamps and full context

### 12. subagentstart hook

**fires:** when a subagent (task tool) spawns
**payload:** `agent_id`, `agent_type`, session info
**enhanced:** subagent spawn logging with optional tts announcement

### 13. setup hook

**fires:** when claude enters a repository (init) or periodically (maintenance)
**payload:** `trigger` ("init" or "maintenance"), session info
**enhanced:** environment persistence via `claude_env_file`, context injection via `additionalcontext`
