from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_migration_revisions():
    """Verifies that the Alembic migration history and baseline revisions are valid."""
    alembic_cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(alembic_cfg)
    revisions = list(script.walk_revisions())

    assert len(revisions) >= 2
    head_rev = revisions[0]
    assert head_rev.revision == "0002_hero_class_and_due_time"
    assert head_rev.down_revision == "0001_initial_schema"

    base_rev = revisions[-1]
    assert base_rev.revision == "0001_initial_schema"
    assert base_rev.down_revision is None
