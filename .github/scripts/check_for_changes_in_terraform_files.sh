#!/bin/bash -u
# $1: デプロイパイプラインのパス
# $2: ベースブランチ
# $3: プルリクエストのヘッドブランチ
echo "\$1: $1"
echo "\$2: $2"
echo "\$3: $3"

REPO_ROOT="$(git rev-parse --show-toplevel)"

normalize_path() {
  local target="$1"
  if [[ -z "$target" ]]; then
    echo ""
    return
  fi

  if [[ "$target" == /* ]]; then
    local stripped="${target#"$REPO_ROOT"/}"
    if [[ "$stripped" == "$target" ]]; then
      stripped="${target#"$REPO_ROOT"}"
    fi
    echo "$stripped"
  else
    echo "${target#./}"
  fi
}

git fetch origin "$2"
git fetch origin "$3"
git switch -C "$3"
CHANGED_FILES="$(git diff --name-only "origin/$2" "$3" | sort -u)"

echo "----------------------------------"
echo "CHANGED_FILES: "
echo "${CHANGED_FILES}"

if [ -z "${CHANGED_FILES}" ]; then
  echo "No changed."
  exit 1
fi

is_changed() {
  local changed_file="$1"
  local target_path="$2"
  local compare_path
  compare_path="$(normalize_path "$target_path")"

  if [[ -z "$compare_path" ]]; then
    return 1
  fi

  echo "\$changed_file: ${changed_file}"
  echo "\$compare_path: ${compare_path}/*.*"

  if [[ "$changed_file" == "$compare_path" ]] || [[ "$changed_file" == "$compare_path/"* ]]; then
    echo "デプロイパイプラインで使用しているリソースが変更されたので処理対象です。"
    exit 0
  fi

  if [ ! -d "$compare_path" ]; then
    return 1
  fi

  local tf_files
  tf_files=$(find "${compare_path}" -type f -name "*.tf")
  for tf_file in $tf_files; do
    if [[ "${tf_file}" =~ .*(provider|terraform)\.tf$ ]]; then
      continue
    fi

    local module_paths
    module_paths=$(awk '/module .+ {/{getline; if($1=="source") print $3}' "${tf_file}" | sed 's/"//g')
    if [ -z "${module_paths}" ]; then
      continue
    fi

    for module_path in $module_paths; do
      (
        local module_dir
        module_dir="$(dirname "$tf_file")"
        cd "$module_dir" || exit 2
        local abs_source_path
        abs_source_path="$(realpath -e "${module_path}" 2>/dev/null)" || exit 2
        local relative_source_path
        relative_source_path="$(normalize_path "$abs_source_path")"
        is_changed "${changed_file}" "${relative_source_path}"
      )
      case $? in
        0)
          exit 0
          ;;
        2)
          continue
          ;;
      esac
    done
  done
  return 1
}

for file in $CHANGED_FILES; do
  if [[ "${file}" =~ ^\.github/(actions|workflows)/.*\.yml$ ]]; then
    echo "共通のワークフローが修正されたのでこのデプロイパイプラインは処理対象です。"
    exit 0
  fi
  is_changed "${file}" "$1"
done

exit 1
