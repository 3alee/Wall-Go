import BouncingImages from "../components/BouncingImages";
import "../styles/App.css";

function HomePage({ onPlay, onRules, onAbout }) {
    return (
        <main className="container">
            <BouncingImages />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <h1
                    style={{
                        marginTop: "clamp(3rem, 10vh, 4rem)",
                        fontSize: "clamp(1.5rem, 8vh, 5rem)",
                    }}
                >
                    Wall Go
                </h1>

                <form
                    onSubmit={onPlay}
                    style={{
                        width: "clamp(5rem, 15vw, 10rem)",
                        height: "10vh",
                        marginTop: "clamp(2.7rem, 5vh, 4rem)",
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        borderRadius: "8px",
                    }}
                >
                    <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "clamp(1rem, 3vh, 10rem)"
                    }}
                    >
                        Play
                    </button>
                </form>

                <form
                    onSubmit={onRules}
                    style={{
                        width: "clamp(5rem, 15vw, 10rem)",
                        height: "10vh",
                        marginTop: "clamp(2.7rem, 1vh, 4rem)",
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        borderRadius: "8px",
                    }}
                >
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "clamp(1rem, 3vh, 10rem)"
                        }}
                    >
                        Rules
                    </button>
                </form>

                <form
                    onSubmit={onAbout}
                    style={{
                        width: "clamp(5rem, 15vw, 10rem)",
                        height: "10vh",
                        marginTop: "clamp(2.7rem, 5vh, 4rem)",
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                    }}
                >
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "clamp(1rem, 3vh, 10rem)"
                        }}
                    >
                        About
                    </button>
                </form>
            </div>
        </main>
    );
}

export default HomePage;