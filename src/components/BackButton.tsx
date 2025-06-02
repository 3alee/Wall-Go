export default function BackButton({ onBack }: { onBack: (e: React.FormEvent) => void }) {
    return (
        <form
        onSubmit={onBack}
        style={{
            width: "clamp(5rem, 15vw, 10rem)",
            height: "10vh",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
            top: "1vh",
            left: "1vw",
            zIndex: 20,
            position: "absolute",
        }}
        >
        <button
            type="submit"
            style={{
            width: "100%",
            padding: "12px",
            fontSize: "clamp(1rem, 3vh, 10rem)",
            }}
        >
            Menu
        </button>
        </form>
    );
}
