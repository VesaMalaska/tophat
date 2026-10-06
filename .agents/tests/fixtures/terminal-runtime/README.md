# Generic terminal runtime fixture

Test-owned Node program; no host renderer or engine dependency. Non-TTY echo mode observes stream/exit behavior. Interactive mode requires a Linux PTY with available util-linux script and stty. The parent sets a controlled size, captures original/final stty state and verifies equality after normal, controlled-error and SIGINT exits. Input and resize are observed through Node's actual TTY streams. The test asserts expected application exits while its own validation result remains zero only on successful assertions.

The harness has a deadline/output bound and preserves captured errors. It never modifies the user's controlling terminal; the child owns a disposable PTY. Tool flags are fixture-specific and no OS tools are installed automatically. No terminal-emulator glyph/font, native application renderer, product journey, external engine, Windows/macOS or universal process-sandbox certification is claimed.
