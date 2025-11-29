import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newAmenity, setNewAmenity] = useState({
    name: '',
    type: 'park',
    location: '',
    description: ''
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (activeTab === 'complaints' || activeTab === 'dashboard') {
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

  const updateComplaintStatus = async (id, status) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      fetchComplaints();
    }
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('amenities')
      .insert([newAmenity]);

    if (!error) {
      setNewAmenity({ name: '', type: 'park', location: '', description: '' });
      fetchAmenities();
    }
  };

  const handleDeleteAmenity = async (id) => {
    const { error } = await supabase
      .from('amenities')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAmenities();
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('announcements')
      .insert([{ ...newAnnouncement, created_by: user.id }]);

    if (!error) {
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAnnouncements();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    totalComplaints: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In-Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Smart City Admin</span>
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
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                Complaints
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'amenities' ? 'active' : ''}`}
                onClick={() => setActiveTab('amenities')}
              >
                Amenities
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
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="mb-4">Dashboard Overview</h2>
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card text-center stats-card">
                      <div className="card-body">
                        <h3 className="display-4">{stats.totalComplaints}</h3>
                        <p className="text-muted">Total Complaints</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center stats-card bg-warning text-white">
                      <div className="card-body">
                        <h3 className="display-4">{stats.pending}</h3>
                        <p>Pending</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center stats-card bg-info text-white">
                      <div className="card-body">
                        <h3 className="display-4">{stats.inProgress}</h3>
                        <p>In Progress</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center stats-card bg-success text-white">
                      <div className="card-body">
                        <h3 className="display-4">{stats.resolved}</h3>
                        <p>Resolved</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mb-3">Recent Complaints</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Issue</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 5).map(complaint => (
                        <tr key={complaint.id}>
                          <td>{complaint.name}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div>
                <h2 className="mb-4">Manage Complaints</h2>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Issue</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map(complaint => (
                          <tr key={complaint.id}>
                            <td>{complaint.name}</td>
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
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={complaint.status}
                                onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div>
                <h2 className="mb-4">Manage Amenities</h2>

                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Add New Amenity</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddAmenity}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAmenity.name}
                            onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            value={newAmenity.type}
                            onChange={(e) => setNewAmenity({...newAmenity, type: e.target.value})}
                          >
                            <option value="park">Park</option>
                            <option value="school">School</option>
                            <option value="hospital">Hospital</option>
                            <option value="library">Library</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Location</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAmenity.location}
                            onChange={(e) => setNewAmenity({...newAmenity, location: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAmenity.description}
                            onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                          />
                        </div>
                        <div className="col-12">
                          <button type="submit" className="btn btn-primary">
                            Add Amenity
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="row g-3">
                  {amenities.map(amenity => (
                    <div key={amenity.id} className="col-md-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{amenity.name}</h5>
                          <p className="card-text">
                            <span className="badge bg-secondary mb-2">{amenity.type}</span><br />
                            <small className="text-muted">📍 {amenity.location}</small><br />
                            {amenity.description}
                          </p>
                        </div>
                        <div className="card-footer">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAmenity(amenity.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div>
                <h2 className="mb-4">Manage Announcements</h2>

                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Create New Announcement</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddAnnouncement}>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Content</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Post Announcement
                      </button>
                    </form>
                  </div>
                </div>

                <div className="list-group">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h5 className="mb-1">{announcement.title}</h5>
                          <p className="mb-1">{announcement.content}</p>
                          <small className="text-muted">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
