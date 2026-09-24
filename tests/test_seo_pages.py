"""Модульные тесты для SEO-страниц арканов судьбы, каталога и карты сайта."""

from pathlib import Path
from starlette.testclient import TestClient

from api.main import app

BASE_DIR = Path(__file__).resolve().parent.parent


def test_all_22_arcana_html_files_exist():
    """Проверяет наличие всех 22 файлов арканов и каталога arcana.html."""
    catalog = BASE_DIR / "arcana.html"
    assert catalog.is_file(), "arcana.html должен существовать"

    for i in range(1, 23):
        f = BASE_DIR / f"arcan-{i}.html"
        assert f.is_file(), f"Файл arcan-{i}.html должен существовать"
        assert f.stat().st_size > 1000, f"Файл arcan-{i}.html не должен быть пустым"


def test_arcana_html_seo_structure():
    """Проверяет обязательную SEO-разметку на страницах арканов."""
    for i in range(1, 23):
        f = BASE_DIR / f"arcan-{i}.html"
        content = f.read_text(encoding="utf-8")

        # Обязательные мета-теги
        assert "<title>" in content, f"В arcan-{i}.html отсутствует <title>"
        assert '<meta name="description"' in content, f"В arcan-{i}.html отсутствует meta description"
        assert '<link rel="canonical"' in content, f"В arcan-{i}.html отсутствует canonical"
        assert '<meta property="og:title"' in content, f"В arcan-{i}.html отсутствует og:title"
        assert '<meta property="og:image"' in content, f"В arcan-{i}.html отсутствует og:image"

        # Schema.org разметка
        assert "application/ld+json" in content, f"В arcan-{i}.html отсутствует Schema.org JSON-LD"
        assert "BreadcrumbList" in content, f"В arcan-{i}.html отсутствует BreadcrumbList"
        assert "FAQPage" in content, f"В arcan-{i}.html отсутствует FAQPage"

        # Семантика и контент
        assert "<h1" in content, f"В arcan-{i}.html отсутствует h1"
        assert "Энергия в плюсе" in content, f"В arcan-{i}.html отсутствуют плюсы"
        assert "Энергия в минусе" in content, f"В arcan-{i}.html отсутствуют минусы"


def test_sitemap_contains_all_seo_urls():
    """Проверяет, что sitemap.xml содержит все 22 аркана и каталог."""
    sitemap = BASE_DIR / "sitemap.xml"
    assert sitemap.is_file(), "sitemap.xml должен существовать"
    content = sitemap.read_text(encoding="utf-8")

    assert "https://shadowlinkapp.online/arcana.html" in content
    assert "https://shadowlinkapp.online/natal.html" in content

    for i in range(1, 23):
        url = f"https://shadowlinkapp.online/arcan-{i}.html"
        assert url in content, f"В sitemap.xml отсутствует {url}"


def test_fastapi_clean_seo_endpoints():
    """Проверяет отдачу SEO-страниц через FastAPI TestClient."""
    client = TestClient(app)

    # Проверка чистого каталога
    res_catalog = client.get("/arcana")
    assert res_catalog.status_code == 200
    assert "22 Аркана Судьбы" in res_catalog.text

    # Проверка страниц арканов без .html
    res_arcan_1 = client.get("/arcan-1")
    assert res_arcan_1.status_code == 200
    assert "Маг" in res_arcan_1.text

    res_arcan_22 = client.get("/arcan-22")
    assert res_arcan_22.status_code == 200
    assert "Шут" in res_arcan_22.text

    # Проверка несуществующего аркана
    res_not_found = client.get("/arcan-99")
    assert res_not_found.status_code == 404


def test_fastapi_head_requests():
    """Проверяет корректность обработки HEAD-запросов (200 OK без 405 Method Not Allowed)."""
    client = TestClient(app)

    res_root = client.head("/")
    assert res_root.status_code == 200, f"HEAD / должен возвращать 200, получено {res_root.status_code}"

    res_arcana = client.head("/arcana")
    assert res_arcana.status_code == 200, f"HEAD /arcana должен возвращать 200, получено {res_arcana.status_code}"

    res_arcan_1 = client.head("/arcan-1")
    assert res_arcan_1.status_code == 200, f"HEAD /arcan-1 должен возвращать 200, получено {res_arcan_1.status_code}"

    res_health = client.head("/api/health")
    assert res_health.status_code == 200, f"HEAD /api/health должен возвращать 200, получено {res_health.status_code}"


def test_404_page_routing():
    """Проверяет наличие 404.html и корректную отдачу стилизованной страницы ошибок."""
    f = BASE_DIR / "404.html"
    assert f.is_file(), "404.html должен существовать"
    content = f.read_text(encoding="utf-8")
    assert "404" in content
    assert "Шут" in content
    assert 'href="/"' in content or "href=\"/\"" in content
    assert "/#reads" in content

    client = TestClient(app)
    # Запрос на неизвестный путь должен отдавать статус 404 и HTML-контент страницы 404
    res_404 = client.get("/random-astral-lost-page")
    assert res_404.status_code == 404
    assert "Астральная ошибка 404" in res_404.text
    assert "Шут" in res_404.text


