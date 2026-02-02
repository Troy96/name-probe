# name-probe

CLI tool to check name availability across GitHub, npm, PyPI, and domains.

## Installation

```bash
git clone https://github.com/Troy96/name-probe.git
cd name-probe
npm install
npm run build
npm link
```

## Usage

### Check a name

```bash
name-probe check "myproject"
```

Output:
```
Results for "myproject":

  GitHub       ✗ Taken
  npm          ✗ Taken
  PyPI         ✗ Taken
  myproject.com✗ Taken

Availability Score: 0%
```

### Check specific platforms

```bash
name-probe check "myproject" --platforms github,npm
```

### Check multiple domain TLDs

```bash
name-probe check "myproject" --domains com,io,dev
```

### JSON output

```bash
name-probe check "myproject" --json
```

### Generate name suggestions

```bash
name-probe suggest "myapp"
name-probe suggest "myapp" --count 5
```

This generates variations using common prefixes (`go`, `get`, `use`, `try`, `my`, `the`) and suffixes (`hq`, `app`, `io`, `lab`, `kit`, `dev`, `hub`), checks availability for each, and ranks by availability score.

## Options

### `check` command

| Option | Description |
|--------|-------------|
| `-p, --platforms <list>` | Comma-separated platforms: `github`, `npm`, `pypi`, `domain` |
| `-d, --domains <list>` | Comma-separated TLDs to check (default: `com`) |
| `--no-cache` | Bypass the cache |
| `--json` | Output as JSON |

### `suggest` command

| Option | Description |
|--------|-------------|
| `-c, --count <n>` | Number of suggestions to show (default: 10) |
| `-p, --platforms <list>` | Comma-separated platforms to check |
| `-d, --domains <list>` | Comma-separated TLDs to check |
| `--no-cache` | Bypass the cache |
| `--json` | Output as JSON |

## Caching

Results are cached in `~/.nameprobe/cache/`:
- "Available" results: 1 hour TTL
- "Taken" results: 24 hour TTL

Use `--no-cache` to bypass.

## Configuration

Copy `.env.example` to `.env` for optional configuration:

```bash
# Increases GitHub API rate limit
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Custom cache TTLs (seconds)
CACHE_TTL_AVAILABLE=3600
CACHE_TTL_TAKEN=86400
```

## License

MIT
