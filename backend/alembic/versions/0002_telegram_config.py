"""add Telegram notification configuration"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    if not sa.inspect(bind).has_table("telegram_config"):
        op.create_table(
            "telegram_config",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("bot_token_encrypted", sa.Text(), nullable=True),
            sa.Column("chat_id", sa.String(length=120), nullable=True),
            sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )


def downgrade():
    bind = op.get_bind()
    if sa.inspect(bind).has_table("telegram_config"):
        op.drop_table("telegram_config")
