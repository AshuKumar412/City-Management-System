import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newComplaint, setNewComplaint] = useState({
    name: user?.full_name || '',
    issue: '',
    location: ''
  });

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
    if (activeTab === 'amenities') {
      fetchAmenities();
    }
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setLoading(false);
  };

  const fetchAmenities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAmenities(data);
    }
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('complaints')
      .insert([{ ...newComplaint, user_id: user.id }]);

    if (!error) {
      setNewComplaint({ name: user.full_name, issue: '', location: '' });
      fetchComplaints();
      alert('Complaint submitted successfully!');
    }
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

  return (
    <div className="citizen-dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container-fluid">
          <span className="navbar-brand">Smart City Portal</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-white me-3">Welcome, {user.full_name}</span>
            <ThemeToggle />
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-md-2">
            <div className="list-group">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                My Complaints
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'submit' ? 'active' : ''}`}
                onClick={() => setActiveTab('submit')}
              >
                Submit Complaint
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'amenities' ? 'active' : ''}`}
                onClick={() => setActiveTab('amenities')}
              >
                City Amenities
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'announcements' ? 'active' : ''}`}
                onClick={() => setActiveTab('announcements')}
              >
                Announcements
              </button>
            </div>
          </div>

          <div className="col-md-10">
            {activeTab === 'complaints' && (
              <div>
                <h2 className="mb-4">My Complaints</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="alert alert-info">
                    You haven't submitted any complaints yet.
                  </div>
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
                        {complaints.map(complaint => (
                          <tr key={complaint.id}>
                            <td>{complaint.issue}</td>
                            <td>{complaint.location}</td>
                            <td>
                              <span className={`badge bg-${
                                complaint.status === 'Resolved' ? 'success' :
                                complaint.status === 'In-Progress' ? 'info' : 'warning'
                              }`}>
                                {complaint.status}
                              </span>
                            </td>
                            <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                            <td>{new Date(complaint.updated_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submit' && (
              <div>
                <h2 className="mb-4">Submit a Complaint</h2>
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmitComplaint}>
                      <div className="mb-3">
                        <label className="form-label">Your Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newComplaint.name}
                          onChange={(e) => setNewComplaint({...newComplaint, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Issue Description</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={newComplaint.issue}
                          onChange={(e) => setNewComplaint({...newComplaint, issue: e.target.value})}
                          placeholder="Describe the issue in detail..."
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newComplaint.location}
                          onChange={(e) => setNewComplaint({...newComplaint, location: e.target.value})}
                          placeholder="Enter the location of the issue"
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-success">
                        Submit Complaint
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div>
                <h2 className="mb-4">City Amenities</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {amenities.map(amenity => (
                      <div key={amenity.id} className="col-md-4">
                        <div className="card h-100 amenity-card">
                          <div className="card-body">
                            <div className="amenity-icon mb-3">
                              {getAmenityIcon(amenity.type)}
                            </div>
                            <h5 className="card-title">{amenity.name}</h5>
                            <p className="card-text">
                              <span className="badge bg-secondary mb-2">{amenity.type}</span><br />
                              <small className="text-muted">📍 {amenity.location}</small><br />
                              <span className="mt-2 d-block">{amenity.description}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div>
                <h2 className="mb-4">City Announcements</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="list-group">
                    {announcements.map(announcement => (
                      <div key={announcement.id} className="list-group-item announcement-item">
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{announcement.title}</h5>
                          <small className="text-muted">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-1">{announcement.content}</p>
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
