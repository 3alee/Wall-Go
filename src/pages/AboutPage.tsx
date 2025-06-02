import BackButton from "../components/BackButton";
import BouncingImages from "../components/BouncingImages";
import "../styles/App.css";

function AboutPage({ onBack }) {
    return (
        <main className="container">
            <BouncingImages />
            <BackButton onBack={onBack} />
            <div
                style={{
                position: "absolute",
                backgroundColor: "rgba(255, 255, 255, 0)", // semi-transparent black
                padding: "12px 20px",
                borderRadius: "40px",
                color: "black",
                fontSize: "1rem",
                zIndex: 10, // higher than bouncing images
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // justifyContent: "center",
                }}
            >
                <h1
                style={{
                    marginTop: "clamp(3rem, 10vh, 20rem)",
                    fontSize: "clamp(1.5rem, 8vh, 5rem)",
                }}
                >
                About
                </h1>
                <p
                style={{
                    width: "80vw",
                    height: "60vh",
                    background: "#fff",
                    border: "2px solid #333",
                    borderRadius: "20px",
                    padding: "16px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,1)",
                    textAlign: "left",
                }}
                >
                Season 2 of the South Korean reality game show <strong>"Devil's Plan"</strong> introduced a simple variation on the
                game Go, aptly named <strong>Wall Go</strong>. For fans out there who are interested in trying out the game for
                themselves, I have developed both a <strong>playable online version</strong>, and a <strong>downloadable cross-platform
                    app</strong>.
                <br /><br />
                The <strong>desktop app</strong> I've created was made using React, Rust and Tauri, and is downloadable for MacOS, Linus and Windows. I
                have personally tested out the MacOS and Windows builds, though the Linux one should work regardless.  <br />
                The <strong>online version</strong> is a WebAssembly port of the same Rust code, and should work on any modern browser.
                </p>
                <ul>
                    <li><a href="https://3alee.github.io/wall-go-wasm/" target="_blank" rel="noopener noreferrer">(Online version) https://3alee.github.io/wall-go-wasm/</a>.</li>
                    <li><a href="https://github.com/3alee/Wall-Go/releases" target="_blank" rel="noopener noreferrer">(App version) https://github.com/3alee/Wall-Go/releases</a>.</li>
                </ul>
            </div>
        </main>
    );
}

export default AboutPage;