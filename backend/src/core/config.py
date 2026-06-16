from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_NAME: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int


    APP_NAME: str = "AI_assisstans"
    debug: bool = True
    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def URL_DATABASE(self) -> str:
        return (
            f"postgresql+asyncpg://"
            f"{self.DB_USER}:{self.DB_PASS}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

settings = Config()