import { ArrowRight } from "lucide-react";


function Hero() {
    return (
        <section class="text-gray-600 body-font bg-[#E8E6DF] ">
            <div class="container mx-auto flex px-5 py-30 md:flex-row flex-col items-center">
                <div class="lg:grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
                    <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">CURATION SHOPORA </h1>
                    <p class="mb-8 leading-relaxed">
                        Less excess.{"\n"}More meaning. Products that combine quality, utility, and design.
                    </p>
                    <div class="flex w-full md:justify-start justify-center items-end">
                        <div class="relative">
                           <a href="#shop" className="flex items-center mt-auto text-white bg-[#172126] border-0 py-2 px-4 focus:outline-none hover:bg-[#69716D] rounded text-lg">
                             Explore the collection <ArrowRight size={16} />
                           </a>     
                        </div>
                    </div>                                        
                </div>
                <div class="lg:max-w-lg lg:w-full md:w-1/2 h-full">
                    <img class="object-cover object-center rounded w-auto h-auto" alt="hero" src="img/hero.jpeg"/>
                </div>
            </div>
        </section>        
    );
}

export default Hero;