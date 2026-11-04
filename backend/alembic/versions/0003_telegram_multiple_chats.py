"""allow multiple Telegram chat IDs"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    columns = {column["name"]: column for column in sa.inspect(bind).get_columns("telegram_config")}
    if not isinstance(columns["chat_id"]["type"], sa.Text):
        op.alter_column("telegram_config", "chat_id", existing_type=sa.String(length=120), type_=sa.Text(), existing_nullable=True)


def downgrade():
    op.alter_column("telegram_config", "chat_id", existing_type=sa.Text(), type_=sa.String(length=120), existing_nullable=True)
