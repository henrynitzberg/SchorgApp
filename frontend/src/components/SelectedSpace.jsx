import "../css/SelectedSpace.css";

export default function SelectedSpace({ space }) {
  return (
    <div className="selected-space-wrapper">
      <div className="selected-space-header-wrapper">
        <h1 className="selected-space-header">{space.name}</h1>
        <div className="selected-space-header-wrapper-right">
          <button className="forum-nav-button">
            <img src="/forum.svg" alt="Forum icon" className="forum-nav-img" />
            Forum
          </button>
        </div>
      </div>
    </div>
  );
}
