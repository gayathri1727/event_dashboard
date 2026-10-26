
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api/events";

function AppLayout() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load events");

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setError("Cannot connect to the backend. Check that your server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function deleteEvent(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setEvents((previous) =>
        previous.filter((event) => event._id !== id)
      );
    } catch {
      alert("Could not delete the event. Please check your backend.");
    }
  }

  const filteredEvents = events.filter((event) =>
    `${event.eventName} ${event.venue}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalRegistrations = events.reduce(
    (total, event) =>
      total + Number(event.totalRegistrations ?? event.registrations?.length ?? 0),
    0
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">E</div>
          <div>
            <h2>Eventify</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span>▦</span> Dashboard
          </NavLink>
          <NavLink to="/add-event" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span>＋</span> Add Event
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Event Manager</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">EVENT MANAGEMENT</span>
            <h1>Manage your events</h1>
          </div>
          <NavLink to="/add-event" className="primary-btn top-add">
            + Create Event
          </NavLink>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                events={filteredEvents}
                allEvents={events}
                loading={loading}
                error={error}
                search={search}
                setSearch={setSearch}
                totalRegistrations={totalRegistrations}
                onDelete={deleteEvent}
                onRefresh={fetchEvents}
              />
            }
          />
          <Route
            path="/add-event"
            element={<EventForm onSaved={fetchEvents} />}
          />
          <Route
            path="/edit-event/:id"
            element={<EventForm events={events} onSaved={fetchEvents} />}
          />
        </Routes>

        <footer className="footer">
          Eventify Admin Panel <span>•</span> Event management made simple
        </footer>
      </main>
    </div>
  );
}

function Dashboard({
  events,
  allEvents,
  loading,
  error,
  search,
  setSearch,
  totalRegistrations,
  onDelete,
  onRefresh,
}) {
  const navigate = useNavigate();

  return (
    <section className="page-content">
      <div className="welcome-row">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Here’s what’s happening with your events.</p>
        </div>
        <button className="outline-btn" onClick={onRefresh}>↻ Refresh</button>
      </div>

      <div className="stats-grid">
        <StatCard icon="▦" label="Total Events" value={allEvents.length} color="purple" />
        <StatCard icon="✓" label="Total Registrations" value={totalRegistrations} color="green" />
        <StatCard
          icon="◷"
          label="Upcoming Events"
          value={allEvents.filter((event) => event.eventDate && new Date(event.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0))).length}
          color="orange"
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>All Events</h2>
            <p>View and manage your event schedule.</p>
          </div>
          <NavLink to="/add-event" className="primary-btn">+ Add Event</NavLink>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search events or venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="result-count">{events.length} events</span>
        </div>

        {error && (
          <div className="error-box">
            {error}
            <button onClick={onRefresh}>Try again</button>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <h3>{search ? "No matching events" : "No events yet"}</h3>
            <p>{search ? "Try another search term." : "Create your first event to get started."}</p>
            {!search && <NavLink to="/add-event" className="primary-btn">+ Create your first event</NavLink>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>EVENT ID</th>
                  <th>EVENT DETAILS</th>
                  <th>EVENT DATE</th>
                  <th>VENUE</th>
                  <th>REGISTRATIONS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={event._id || index}>
                    <td><span className="id-label">EV-{String(index + 1).padStart(3, "0")}</span></td>
                    <td>
                      <div className="event-cell">
                        <div className="event-icon">{event.eventName?.charAt(0)?.toUpperCase() || "E"}</div>
                        <div>
                          <strong>{event.eventName}</strong>
                          <small>{event.eventDescription || "No description provided"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—"}</td>
                    <td>{event.venue || "—"}</td>
                    <td>
                      <span className="registration-badge">
                        {event.totalRegistrations ?? event.registrations?.length ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit-btn"
                          title="Update event"
                          onClick={() => navigate(`/edit-event/${event._id}`)}
                        >✎ <span>Edit</span></button>
                        <button
                          className="delete-btn"
                          title="Delete event"
                          onClick={() => onDelete(event._id)}
                        >⌫ <span>Delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <span className="stat-caption">Across all events</span>
      </div>
    </div>
  );
}

function EventForm({ events = [], onSaved }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const existingEvent = events.find((event) => event._id === id);

  const [form, setForm] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    venue: "",
  });
  const [loading, setLoading] = useState(isEditing && !existingEvent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!isEditing) {
        setForm({ eventName: "", eventDescription: "", eventDate: "", venue: "" });
        setLoading(false);
        return;
      }

      try {
        let event = existingEvent;

        if (!event) {
          const response = await fetch(`${API_URL}/${id}`);
          if (!response.ok) throw new Error("Could not find this event");
          event = await response.json();
        }

        if (!cancelled) {
          setForm({
            eventName: event.eventName || "",
            eventDescription: event.eventDescription || "",
            eventDate: event.eventDate ? String(event.eventDate).slice(0, 10) : "",
            venue: event.venue || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvent();
    return () => { cancelled = true; };
  }, [id, isEditing, existingEvent]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${id}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to save event");

      await onSaved();
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-content"><div className="panel empty-state">Loading event details...</div></div>;

  return (
    <section className="page-content form-page">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">{isEditing ? "EDIT EVENT" : "NEW EVENT"}</span>
          <h2>{isEditing ? "Update Event" : "Create an Event"}</h2>
          <p>{isEditing ? "Make changes to your event details below." : "Fill in the details to add a new event to your schedule."}</p>
        </div>
        <button className="outline-btn" onClick={() => navigate("/")}>← Back to dashboard</button>
      </div>

      <div className="form-layout">
        <div className="panel event-form-panel">
          <div className="form-heading">
            <div className="form-heading-icon">✦</div>
            <div>
              <h3>Event Information</h3>
              <p>Fields marked with * are required.</p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="eventName">Event Name <span>*</span></label>
              <input
                id="eventName"
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                placeholder="e.g. Annual Tech Conference"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDescription">Event Description <span>*</span></label>
              <textarea
                id="eventDescription"
                name="eventDescription"
                value={form.eventDescription}
                onChange={handleChange}
                placeholder="Tell attendees what this event is about..."
                rows="5"
                required
                maxLength={1000}
              />
              <small className="field-hint">{form.eventDescription.length}/1000 characters</small>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="eventDate">Event Date <span>*</span></label>
                <input
                  id="eventDate"
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="venue">Venue <span>*</span></label>
                <input
                  id="venue"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium"
                  required
                  maxLength={150}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="outline-btn" onClick={() => navigate("/")}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "✓ Save Changes" : "+ Create Event"}
              </button>
            </div>
          </form>
        </div>

        <aside className="form-tip">
          <div className="tip-icon">✦</div>
          <h3>Make it memorable</h3>
          <p>Give your event a clear name, useful description, and accurate venue so your team can manage it with ease.</p>
          <div className="tip-divider"></div>
          <div className="tip-point"><span>✓</span> Use a descriptive event name</div>
          <div className="tip-point"><span>✓</span> Double-check the date</div>
          <div className="tip-point"><span>✓</span> Enter the complete venue</div>
        </aside>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
