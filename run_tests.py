"""
Универсальный запуск всех тестов проекта TARO Navigator:
1. Проверка кодировки (UTF-8 без BOM, отсутствие битых символов)
2. Синтаксический анализ Python (py_compile)
3. Синтаксический анализ JavaScript (node --check)
4. Unit-тесты бэкенда и нумерологии (pytest)
5. Unit-тесты астрономического модуля (node tests/test_natal.js)
"""
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


def check_encodings() -> bool:
    print("1. [UTF-8 Audit] Проверка кодировки файлов...")
    target_exts = {".html", ".js", ".css", ".py", ".md", ".xml", ".json"}
    errors = 0
    checked = 0
    root = Path(__file__).resolve().parent

    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(p in path.parts for p in (".git", "venv", "__pycache__", "node_modules", ".gemini", ".idea")):
            continue
        if path.suffix.lower() in target_exts:
            checked += 1
            raw = path.read_bytes()
            if raw[:3] == b"\xef\xbb\xbf":
                print(f"  ❌ Ошибка BOM: {path.relative_to(root)}")
                errors += 1
            if b"\xff\xfd" in raw:
                print(f"  ❌ Ошибка кодировки (0xFFFD): {path.relative_to(root)}")
                errors += 1

    if errors == 0:
        print(f"  ✔ Проверено {checked} файлов. Все файлы в UTF-8 без BOM.")
        return True
    return False


def run_py_compile() -> bool:
    print("\n2. [Python Compile] Компиляция Python-файлов...")
    res = subprocess.run([sys.executable, "-m", "compileall", "-q", "bot", "api", "tests"])
    if res.returncode == 0:
        print("  ✔ Все Python-файлы успешно скомпилированы.")
        return True
    print("  ❌ Ошибки компиляции Python!")
    return False


def run_js_check() -> bool:
    print("\n3. [Node Check] Синтаксический анализ JavaScript...")
    js_files = ["js/app.js", "js/natal.js", "js/space.js", "tests/test_natal.js"]
    for f in js_files:
        res = subprocess.run(["node", "--check", f], capture_output=True, encoding="utf-8", errors="replace")
        if res.returncode != 0:
            print(f"  ❌ Ошибка синтаксиса в {f}: {res.stderr}")
            return False
    print("  ✔ Все JS-файлы валидны.")
    return True


def run_pytest() -> bool:
    print("\n4. [PyTest] Запуск модульных тестов бэкенда и нумерологии...")
    res = subprocess.run([sys.executable, "-m", "pytest", "-v", "tests/"])
    if res.returncode == 0:
        print("  ✔ Все Python unit-тесты успешно пройдены.")
        return True
    print("  ❌ Ошибки в тестах pytest!")
    return False


def run_js_tests() -> bool:
    print("\n5. [Node Tests] Запуск тестов астрономического движка...")
    res = subprocess.run(["node", "tests/test_natal.js"], capture_output=True, encoding="utf-8", errors="replace")
    if res.returncode == 0:
        if res.stdout:
            print(res.stdout.strip())
        print("  ✔ Все JS unit-тесты успешно пройдены.")
        return True
    print(f"  ❌ Ошибка в тестах JS:\n{res.stderr}")
    return False


def main():
    print("=" * 60)
    print("  TARO NAVIGATOR — КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ")
    print("=" * 60)

    stages = [
        ("Проверка кодировок", check_encodings),
        ("Компиляция Python", run_py_compile),
        ("Валидация JavaScript", run_js_check),
        ("PyTest тесты", run_pytest),
        ("Node JS тесты", run_js_tests),
    ]

    for name, stage_fn in stages:
        if not stage_fn():
            print(f"\n❌ ТЕСТЫ ПРОВАЛЕНЫ на этапе: {name}")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("🎉 ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ!")
    print("=" * 60)


if __name__ == "__main__":
    main()
