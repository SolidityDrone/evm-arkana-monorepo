.PHONY: build compile clean test help

# Build all generated circuits
build:
	@echo "Building all generated circuits..."
	pnpm run build:all

# Compile all main circuits
compile:
	@echo "Compiling all main circuits..."
	pnpm run compile:all

# Run all tests
test:
	@echo "Running tests..."
	pnpm run test:all

# Clean all artifacts
clean:
	@echo "Cleaning artifacts..."
	pnpm run clean

# Clean everything including node_modules
clean-all:
	@echo "Cleaning everything..."
	pnpm run clean:all

# Help
help:
	@echo "Available targets:"
	@echo "  build      - Generate all library circuits"
	@echo "  compile    - Compile all main circuits"
	@echo "  test       - Run all tests"
	@echo "  clean      - Remove compiled artifacts"
	@echo "  clean-all  - Remove all artifacts and pnpm cache"
	@echo ""
	@echo "Individual circuit compilation:"
	@echo "  pnpm run compile:entry"
	@echo "  pnpm run compile:deposit"
	@echo "  pnpm run compile:withdraw"
	@echo "  pnpm run compile:send"


