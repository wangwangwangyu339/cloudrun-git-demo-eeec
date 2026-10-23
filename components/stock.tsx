type StockProps = {
  price: number;
  symbol: string;
};

export function Stock({ price, symbol }: StockProps) {
  return (
    <div className="stock-card">
      <p className="stock-card__eyebrow">Quote</p>
      <h2 className="stock-card__symbol">{symbol}</h2>
      <p className="stock-card__price">
        ${price.toFixed(2)}
        <span>USD</span>
      </p>
    </div>
  );
}
