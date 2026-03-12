import React from "react";
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from "lucide-react";

const FooterHome = () => {
  return (
    <footer className="bg-[#71532E] text-white">
      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Put <span className="italic font-serif">askField</span> to the Test
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start Discovering What's Possible
        </h2>

        <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
          Launch your research with confidence by contributing your perspective to high-quality 
          studies. With askField, researchers get fast, reliable insights from real participants, while 
          contributors enjoy ways to share their experiences and get compensated.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-amber-900 transition-all duration-300">
            Start collecting data
          </button>
          <button className="px-8 py-3 bg-white text-amber-900 rounded-full font-medium hover:bg-white/90 transition-all duration-300">
            Contribute and get paid
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-white/20"></div>
      </div>

      {/* Footer Bottom Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Logo and Description */}
          <div className="space-y-6">
            <div className="text-4xl font-bold">
              <span className="italic font-serif">ask</span>Field
            </div>

            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              At askField, we empower businesses with actionable insights through an AI-driven 
              platform that simplifies data integration, analysis, and decision-making. Our 
              advanced machine learning models provide personalized recommendations, sales 
              forecasts, and customer segmentation to help you stay ahead of market trends. 
              Built with flexibility and scalability in mind, askField seamlessly integrates with 
              multiple data sources, enabling businesses to turn raw data into valuable insights 
              effortlessly. Whether you're a developer seeking data-driven solutions or a 
              business aiming for smarter decisions, askField is your go-to platform for 
              unlocking the power of data.
            </p>
          </div>

          {/* Right Side - Contact Info and Social */}
          <div className="space-y-6 md:text-right">
            <div className="flex items-center gap-3 md:justify-end">
              <Mail className="w-5 h-5" />
              <a href="mailto:contact@ruthdata.com" className="hover:underline">
                contact@ruthdata.com
              </a>
            </div>

            <div className="flex items-center gap-3 md:justify-end flex-wrap">
              <Phone className="w-5 h-5" />
              <div className="flex flex-wrap gap-2">
                <a href="tel:+2348061402043" className="hover:underline">+234 806 1402 043</a>
                <span>•</span>
                <a href="tel:+2347017383237" className="hover:underline">+234 701 7383 237</a>
              </div>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <MapPin className="w-5 h-5 shrink-0" />
              <span>No 1A Ipaduma, Asokoro Abuja.</span>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-3 md:justify-end mt-6">
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-amber-900 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-amber-900 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-amber-900 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-white/60 mt-8">
              © 2025 askField. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterHome;