"""store image classification metadata"""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("detections", sa.Column("classification", sa.String(length=32), nullable=True))
    op.add_column("detections", sa.Column("confidence", sa.Float(), nullable=True))
    op.add_column("detections", sa.Column("confidence_margin", sa.Float(), nullable=True))
    op.add_column("detections", sa.Column("model_label", sa.String(length=120), nullable=True))
    op.add_column("detections", sa.Column("model_accepted", sa.Boolean(), nullable=True))
    op.create_index("ix_detections_classification", "detections", ["classification"], unique=False)


def downgrade():
    op.drop_index("ix_detections_classification", table_name="detections")
    op.drop_column("detections", "model_accepted")
    op.drop_column("detections", "model_label")
    op.drop_column("detections", "confidence_margin")
    op.drop_column("detections", "confidence")
    op.drop_column("detections", "classification")
