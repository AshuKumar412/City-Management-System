import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import ReportIssue from "../components/ReportIssue";

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'amenities') fetchAmenities();
    if (activeTab === 'announcements') fetchAnnouncements();
  }, [activeTab, user]);

  const fetchComplaints = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  const fetchAmenities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('amenities')
      .select('*')
      .order('created_at', { ascending: false });
    setAmenities(data || []);
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAmenityIcon = (type) => {
    switch (type) {
      case 'park': return '🌳';
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'library': return '📚';
      default: return '📍';
    }
  };

  if (!user) return null;

  return (
    <div className="citizen-dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container-fluid">
          <span className="navbar-brand">Smart City Portal</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-white me-3">Welcome, {user.full_name}</span>
            <ThemeToggle />
            <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-md-2">
            <div className="list-group">
              <button className={`list-group-item list-group-item-action ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>My Complaints</button>
              <button className={`list-group-item list-group-item-action ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>Submit Complaint</button>
              <button className={`list-group-item list-group-item-action ${activeTab === 'amenities' ? 'active' : ''}`} onClick={() => setActiveTab('amenities')}>City Amenities</button>
              <button className={`list-group-item list-group-item-action ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>Announcements</button>
            </div>
          </div>

          <div className="col-md-10">

            {/* COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <div>
                <h2 className="mb-4">My Complaints</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status"></div>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="alert alert-info">You haven't submitted any complaints yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Issue</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map(c => (
                          <tr key={c.id}>
                            <td>{c.issue}</td>
                            <td>{c.location}</td>
                            <td>
                              <span className={`badge bg-${
                                c.status === 'Resolved' ? 'success' :
                                c.status === 'In-Progress' ? 'info' : 'warning'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td>{new Date(c.created_at).toLocaleDateString()}</td>
                            <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUBMIT COMPLAINT TAB */}
            {activeTab === 'submit' && (
              <div>
                <h2 className="mb-4">Submit a Complaint (Photo + Location)</h2>
                <div className="row">
                  <div className="col-md-8 col-lg-6">
                    <ReportIssue user={user} onSubmitSuccess={fetchComplaints} />
                  </div>
                </div>
              </div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === 'amenities' && (
              <div>
                <h2 className="mb-4">City Amenities</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success"></div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {amenities.map(a => (
                      <div key={a.id} className="col-md-4">
                        <div className="card h-100 amenity-card">
                          <div className="card-body">
                            <div className="amenity-icon mb-3">{getAmenityIcon(a.type)}</div>
                            <h5 className="card-title">{a.name}</h5>
                            <p className="card-text">
                              <span className="badge bg-secondary mb-2">{a.type}</span><br />
                              <small className="text-muted">📍 {a.location}</small><br />
                              <span className="mt-2 d-block">{a.description}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ANNOUNCEMENTS TAB */}
            {activeTab === 'announcements' && (
              <div>
                <h2 className="mb-4">City Announcements</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success"></div>
                  </div>
                ) : (
                  <div className="list-group">
                    {announcements.map(a => (
                      <div key={a.id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{a.title}</h5>
                          <small>{new Date(a.created_at).toLocaleDateString()}</small>
                        </div>
                        <p>{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
