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
                    // width: "50vw",
                    // height: "80vh",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                >
                <h1
                    style={{
                    marginTop: "clamp(3rem, 10vh, 4rem)",
                    fontSize: "clamp(1.5rem, 8vh, 5rem)",
                    }}
                >
                    Rules
                </h1>
            </div>
        </main>
    );
}

export default AboutPage;