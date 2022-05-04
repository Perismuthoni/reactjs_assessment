import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [open, setOpen] = useState([])

  const toggleOpen= (id) => {
    if (open.includes(id)) {
     setOpen(open.filter(sid => sid !== id))
    } else {
     let newOpen = [...open]
     newOpen.push(id)
     setOpen(newOpen)
    }
  }

  const handleAddTag = (event) => {
    let res = JSON.parse(localStorage.getItem("students"));
    const id = event.target.name;
    res[id].tag = event.target.value;
    setSearchResults(res);
    localStorage.setItem("students", JSON.stringify(res));
  };
  const [studentsData, setStudentsState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState(studentsData);
  const getStudentsData = () => {
    return fetch("https://api.hatchways.io/assessment/students").then((res) =>
      res.json()
    );
  };

  const handleNameChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleTagChange = (event) => {
    setSearchTag(event.target.value);
  };  
 



  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("students"));
    if (!isFetching && !data) {
      getStudentsData().then((resp) => {
        const data = resp.students.map((v) => ({ ...v, tag: "" }));
        setStudentsState(data);
        setIsFetching(true);
        localStorage.setItem("students", JSON.stringify(data));
      });
    } else {
      setStudentsState(data);
      setIsFetching(true);
    }
  }, [isFetching]);

//implementing filtering by either name or tag
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("students"));
    if (isFetching && Array.isArray(data)) {
      const results = data.filter((student) => {     
      if (!searchTag && searchTerm) {
          return (
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm)
          );
        } else if (searchTag && !searchTerm) {
          return student.tag.toLowerCase().includes(searchTag);
        }       
         else {
          return true;
        }
      });
      setSearchResults(results);
    }
  }, [searchTerm, searchTag, isFetching]);

//filtering student using name and tag creteri

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("students"));
    const filteredStudentsByNameAndTag = data.filter((student) => {
      const firstName = student.firstName.toLowerCase();
      const lastName = student.lastName.toLowerCase();
      const fullName = firstName + lastName;
      const tagName = student.tag.toLowerCase();

      return fullName.includes(searchTerm.toLowerCase()) && tagName.toLowerCase().includes(searchTag)       
    });
    setSearchResults(filteredStudentsByNameAndTag);
  }, [searchTerm, searchTag ]);


  return (
    <div className="web">
    <div className="App">
      {isFetching ? (
        <>
          <form class="search">
            <input
              class="searchTerm"
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={handleNameChange}
            />
          </form>
          <form class="search">
            <input
              class="searchTerm"
              type="text"
              placeholder="Search by tag"
              value={searchTag}
               onChange={handleTagChange}
            />
          </form>

          <div className="container">
            {searchResults.map((student, studentId) => {
              const grades = student.grades;
              let avgGrades = 0;
              if (Array.isArray(grades)) {
                const sumGrades = grades.reduce(
                  (a, b) => parseInt(a, 10) + parseInt(b, 10),
                  0
                );
                avgGrades = sumGrades / grades.length || 0;
              }
              return (
                <div className="row">
                  <div className="column left">
                    <img className="avatar" src={student.pic} alt="Profile" />
                  </div>
                  <div className="column right">
                    <p className="names">
                      <b><h1>
                        {student.firstName} {student.lastName}
                        </h1></b>
                    </p>
                    <p>Email : {student.email}</p>
                    <p>Company : {student.company}</p>
                    <p>Skill : {student.skill}</p>
                    <p>Avarage : {avgGrades}%</p>
                    <p> {student.tag && <div>{student.tag}</div>}</p>

{/* adding a tag to a student */}
                    <input
                      className="newtag"
                      type="text"
                      id="tag"
                      name={studentId}
                      placeholder="Add a tag"
                      onChange={handleAddTag}
                      maxLength="30"
                    />

                   

{/* toggle button to expand the student grades */}
                    <button
                      className="testbutton"
                      type="button"                   

                      onClick={() => toggleOpen(student.id)}
                    >
                    {open.includes(student.id) ? '-' : '+'}
                    </button>
                    {open.includes(student.id) ? (
              <div>
                {student.grades.map((grade, index) =>
                 <p>Test {index + 1}: {grade}%</p>   )}
              </div>) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
// a loader while waiting for the page content
        <div>Loading.....</div>
      )}
    </div>
    </div>
  );
}

export default App;
