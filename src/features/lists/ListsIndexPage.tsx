import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { useData } from "../../app/useData";
import { ListEditor } from "./ListEditor";

export function ListsIndexPage() {
  const { snapshot, actions } = useData();
  const [creating, setCreating] = useState(false);
  const lists = [...(snapshot?.taskLists ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Lister</h1>
      </header>
      <ul className="card list-index">
        <li>
          <Link to="/alle" className="list-index__item">
            Alle oppgaver
          </Link>
        </li>
        <li>
          <Link to="/fullfort" className="list-index__item">
            Fullført
          </Link>
        </li>
        {lists.map((list) => (
          <li key={list.id}>
            <Link to={`/lister/${list.id}`} className="list-index__item">
              <span className="dot" style={{ backgroundColor: list.color }} />
              {list.name}
            </Link>
          </li>
        ))}
      </ul>
      <Button icon={<Plus size={16} aria-hidden="true" />} onClick={() => setCreating(true)}>
        Ny liste
      </Button>
      {creating ? (
        <ListEditor
          list={null}
          nextPosition={lists.length}
          onSave={actions.saveTaskList}
          onDelete={actions.deleteTaskList}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}
