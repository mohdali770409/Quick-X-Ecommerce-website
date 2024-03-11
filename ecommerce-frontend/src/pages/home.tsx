import { Link } from "react-router-dom";
import ProductCard from "../components/product-card";
const Home = () => {
  const addToCartHandler = () => {};

  return (
    <div className="home">
      <section></section>
      <h1>
        Latest Product
        <Link to="/search" className="findmore">
          find more
        </Link>
      </h1>
      <main>
        <ProductCard
          productId="dsgsld"
          name="Macbook"
          price={435}
          stock={435}
          handler={addToCartHandler}
          photo={"https://m.media-amazon.com/images/I/61YCWzjldDL._SX679_.jpg"}
        />
      </main>
    </div>
  );
};

export default Home;
