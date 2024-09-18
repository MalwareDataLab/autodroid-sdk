#!/bin/bash

if [ -n "$PREFIX" ] && [ "$(uname)" == "Darwin" ]; then
  unset PREFIX
fi

DIR=$(cd "$(dirname "$0")/.." && pwd)

if ! [ -x "$(command -v node)" ]; then
  echo "❌ Error: node is not installed." >&2
  exit 1
fi

if [ ! -f "$HOME/.nvm/nvm.sh" ] && [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "❌ Error: nvm is not installed." >&2
  exit 1
fi

source "$HOME/.nvm/nvm.sh" || source "$NVM_DIR/nvm.sh"

if ! [ -x "$(command -v npm)" ]; then
  echo "❌ Error: npm is not installed in bash, see the nvm installation instructions and check your .bashrc or .bash_profile." >&2
  exit 1
fi

if ! [ -x "$(command -v yalc)" ]; then
  echo "⏭ Installing yalc..."
  npm install -g yalc
fi

if ! [ -x "$(command -v yalc)" ]; then
  echo "❌ Error: yalc is not installed. Check npm on PATH." >&2
  exit 1
fi

if ! [ -f "$DIR/package.json" ]; then
  echo "❌ Error: package.json not found in $DIR" >&2
  exit 1
fi

if ! [ -f "$DIR/package-lock.json" ]; then
  echo "❌ Error: package-lock.json not found in $DIR" >&2
  exit 1
fi

PACKAGE_NAME=$(node -p "require('$DIR/package.json').name")

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: package.json name is not set in $DIR" >&2
  exit 1
fi

rm -rf "$DIR/dist"

if [ -f "$DIR/.env" ]; then
  set -a
  source "$DIR/.env"
  set +a
else
  echo "🟧 Warning: .env file not found in $DIR"
fi

if [ -z "$PROJECT_PATH" ]; then
  echo "🟧 Warning: PROJECT_PATH is not set in $DIR/.env"
else
  if ! [ -d "$PROJECT_PATH" ]; then
    echo "❌ Error: PROJECT_PATH is not a directory in $DIR/.env" >&2
    exit 1
  fi

  if ! [ -f "$PROJECT_PATH/package.json" ]; then
    echo "❌ Error: package.json not found in $PROJECT_PATH" >&2
    exit 1
  fi

  if ! [ -f "$PROJECT_PATH/package-lock.json" ]; then
    echo "❌ Error: package-lock.json not found in $PROJECT_PATH" >&2
    exit 1
  fi
fi

executeInProject() {
  if [ -z "$PROJECT_PATH" ]; then
    return
  fi

  local EXEC_ARGS="$@"
  echo "🔀 Executing '$EXEC_ARGS' in $PROJECT_PATH..."

  (
    NODE_VERSION=$(cat "$PROJECT_PATH/.nvmrc")
    cd $PROJECT_PATH
    nvm use $NODE_VERSION --silent
    NEW_PATH=$(echo "$PATH" | sed -e "s/\\/tmp\\/npm\d*-[^\:]*://g")
    export PATH="$NEW_PATH"
    $EXEC_ARGS
  )
}

cleanup() {
  echo "⚪ Cleaning up..."

  if [ -n "$PROJECT_PATH" ]; then
    echo "🔵 Removing $PACKAGE_NAME from $PROJECT_PATH..."
    executeInProject yalc remove $PACKAGE_NAME
    executeInProject npm uninstall $PACKAGE_NAME --silent

    echo "🔄 Installing old dependencies in $PROJECT_PATH using npm... Please wait."
    executeInProject npm install --silent

    echo "🔄 Unregistering $PACKAGE_NAME"
    yalc installations clean $PACKAGE_NAME

    if [ -d "$HOME/.yalc/packages/$PACKAGE_NAME" ]; then
      rm -rf "$HOME/.yalc/packages/$PACKAGE_NAME"
    fi
  fi

  echo "✅ Completed."

  while read -r -t 0; do read -r; done

  exit 0
}

trap cleanup SIGINT SIGTERM

npx --prefix "$DIR/" tsup --watch --onSuccess "yalc push && sleep 7 && yalc push" &

while [ ! -d "$DIR/dist" ]; do
  sleep 1
done

PACKAGE_MAIN=$(node -p "require('$DIR/package.json').main || ''")
PACKAGE_TYPES=$(node -p "require('$DIR/package.json').types || ''")

if [ -n "$PACKAGE_MAIN" ]; then
  while [ ! -f "$DIR/$PACKAGE_MAIN" ]; do
    sleep 1
  done
fi

if [ -n "$PACKAGE_TYPES" ]; then
  echo "⌛ Waiting for $DIR/$PACKAGE_TYPES..."
  while [ ! -f "$DIR/$PACKAGE_TYPES" ]; do
    sleep 1
  done
fi

(cd $DIR && yalc publish)

if [ -n "$PROJECT_PATH" ]; then
  echo "🔄 Adding $PACKAGE_NAME to $PROJECT_PATH..."
  executeInProject yalc add $PACKAGE_NAME

  echo "🔄 Installing dependencies in $PROJECT_PATH using npm... Please wait."
  executeInProject npm install --silent

  if ! grep -q "yalc.lock" "$PROJECT_PATH/.gitignore"; then
    echo "🔄 Adding yalc.lock to .gitignore..."
    echo "" >> "$PROJECT_PATH/.gitignore"
    echo "# yalc" >> "$PROJECT_PATH/.gitignore"
    echo ".yalc" >> "$PROJECT_PATH/.gitignore"
    echo "yalc.lock" >> "$PROJECT_PATH/.gitignore"
  fi
fi

echo "✅ Custom package install complete. Listening for changes. Press CTRL+C and wait for cleanup to finish."

wait
