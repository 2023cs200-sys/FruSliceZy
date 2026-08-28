from dataclasses import dataclass, field


@dataclass(frozen=True)
class WindowConfig:
    title: str = "FruSliceZy"
    size: tuple = (1280, 720)
    background: tuple = (25, 20, 40)


@dataclass(frozen=True)
class CameraConfig:
    position: tuple = (0, 0.5, -18)
    fov: float = 40.0


@dataclass(frozen=True)
class PlayAreaConfig:
    min_x: float = -10.0
    max_x: float = 10.0
    min_y: float = -5.5
    max_y: float = 6.0
    plane_z: float = 0.0
    spawn_y: float = -7.5
    despawn_y: float = -8.5


@dataclass(frozen=True)
class PhysicsConfig:
    gravity: float = 25.0
    launch_speed_min: float = 20.0
    launch_speed_max: float = 24.0
    horizontal_drift_max: float = 3.0


@dataclass(frozen=True)
class SwordConfig:
    slash_speed_threshold: float = 18.0
    blade_radius: float = 0.45
    trail_lifetime: float = 0.25
    trail_max_segments: int = 40


@dataclass(frozen=True)
class SpawnConfig:
    interval_start: float = 0.9
    min_per_wave: int = 1
    max_per_wave: int = 2


@dataclass(frozen=True)
class RoundConfig:
    duration: float = 60.0
    combo_window: float = 1.2


@dataclass(frozen=True)
class NetworkConfig:
    host: str = "0.0.0.0"
    port: int = 8765


@dataclass(frozen=True)
class Config:
    window: WindowConfig = field(default_factory=WindowConfig)
    camera: CameraConfig = field(default_factory=CameraConfig)
    play_area: PlayAreaConfig = field(default_factory=PlayAreaConfig)
    physics: PhysicsConfig = field(default_factory=PhysicsConfig)
    sword: SwordConfig = field(default_factory=SwordConfig)
    spawn: SpawnConfig = field(default_factory=SpawnConfig)
    round: RoundConfig = field(default_factory=RoundConfig)
    network: NetworkConfig = field(default_factory=NetworkConfig)


config = Config()
