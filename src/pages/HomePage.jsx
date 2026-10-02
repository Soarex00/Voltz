import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "./HomePage/HeroSection";
import BatteryFilter from "./HomePage/BatteryFilter";
import HowFunction from "./HomePage/HowFunction";
import ProductCard from "../components/ProductCard";
import About from "./HomePage/About";
import Contacts from "./HomePage/Contact";

function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <HowFunction />
      <BatteryFilter />
      <ProductCard />
      <About />
      <Contacts />
      <Footer />
    </>
  );
}

export default HomePage;
