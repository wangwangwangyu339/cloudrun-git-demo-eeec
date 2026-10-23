type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export function Weather({ temperature, weather, location }: WeatherProps) {
  return (
    <div className="weather-card">
      <p className="weather-card__eyebrow">Weather</p>
      <h2 className="weather-card__title">{location}</h2>
      <p className="weather-card__condition">{weather}</p>
      <p className="weather-card__temp">
        {temperature}
        <span>°C</span>
      </p>
    </div>
  );
}
