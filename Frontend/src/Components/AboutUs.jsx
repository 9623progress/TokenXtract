import React from "react";
import "../style/about.css";

const AboutUs = () => {
  return (
    <div style={{ margin: "100px" }}>
      <section class="about-section">
        <div class="content-container">
          <h2>About Us</h2>
          <p>
            Our project, <strong>Government Fund Distribution System</strong>,
            aims to bring transparency and accountability to public fund
            allocation using cutting-edge <strong>blockchain technology</strong>
            .
          </p>
          <p>
            We replace traditional fund transfers with{" "}
            <strong>digital tokens</strong>, which can be tracked from the{" "}
            <strong>Central Government</strong> to <strong>local bodies</strong>
            , ensuring no leakage, fraud, or misuse.
          </p>
          <p>
            With <strong>smart contracts</strong> automating rules and reverting
            unspent tokens, we aim to build a system where{" "}
            <strong>corruption has no space</strong> and every rupee is
            accounted for.
          </p>
          <p>
            Our mission is to make public finance{" "}
            <strong>transparent, efficient, and secure</strong> through
            decentralized technology.
          </p>
        </div>
      </section>

      <section class="team-section">
        <h3>Meet Our Team</h3>
        <div class="team-container">
          <div class="team-card">
            <h4>Shivani Dighe</h4>
            <p>shivanidighe2003@gmail.com</p>
          </div>

          <div class="team-card">
            <h4>Pragati Jadhav</h4>
            <p>jpragati760@gmail.com</p>
          </div>
          <div class="team-card">
            <h4>Vaishnavi Nathe</h4>
            <p>vaishnavinathe01@gmail.com</p>
          </div>

          <div class="team-card">
            <h4>Nikita Palde</h4>
            <p>nikitapalde@gmail.com</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
