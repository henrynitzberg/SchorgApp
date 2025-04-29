import "../css/SpacesView.css";

export default function SpacesView({ userSpaces, openSpace }) {
  const sampleSpaces = [
    { name: "NVIDIA", tags: ["Work"] },
    { name: "HRI Lab", tags: ["Work"] },
    { name: "Ab Initio", tags: ["Work"] },
    { name: "CS 15", tags: ["Class"] },
    { name: "JumboCode", tags: ["Extracurricular"] },
    { name: "ATO", tags: ["Extracurricular"] },
    { name: "Tufts Swimming and Diving", tags: ["Extracurricular"] },
    { name: "National Student Data Corps", tags: ["Extracurricular"] },
    {
      name: "Tufts Center for Engineering Education and Outreach",
      tags: ["Work"],
    },
    { name: "Center for Human Compatible AI", tags: ["Work"] },
    { name: "Athlete Ally", tags: ["Extracurricular"] },
  ];
  console.log(userSpaces);
  return (
    <div className="spaces-view-wrapper">
      <h1 className="spaces-view-header">Spaces</h1>
      <div className="spaces-view-content-wrapper">
        {sampleSpaces.map((userSpace, i) => {
          return (
            <button
              key={i}
              className="user-space-navigator"
              onClick={(e) => {
                openSpace(e, userSpace);
              }}
            >
              <p className="user-space-name">{userSpace.name}</p>
              <div className="user-space-tags-wrapper">
                {userSpace.tags.map((tag, i) => {
                  return (
                    <p key={i} className="user-space-tag">
                      {tag}
                    </p>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
