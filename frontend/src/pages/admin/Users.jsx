import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { roleOptions } from "../../data/users.js";
import { useToast } from "../../context/ToastContext.jsx";

function AddUserModal({ close, onAdd }) {
  const notify = useToast();
  const [form, setForm] = useState({ name: "", email: "", role: roleOptions[0], temp_password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.temp_password.trim()) {
      notify("Name, email and temporary password are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(form);
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add user" onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label htmlFor="add-name">Name</label>
          <input id="add-name" className="search-input w-100" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
        </div>
        <div className="form-field mb-2">
          <label htmlFor="add-email">Email</label>
          <input id="add-email" type="email" className="search-input w-100" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@company.com" />
        </div>
        <div className="form-field mb-2">
          <label htmlFor="add-role">Role</label>
          <select id="add-role" className="search-input w-100" value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {roleOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-field mb-3">
          <label htmlFor="add-pw">Temporary password</label>
          <input id="add-pw" type="text" className="search-input w-100" value={form.temp_password}
            onChange={(e) => setForm((f) => ({ ...f, temp_password: e.target.value }))}
            placeholder="Min 6 characters" />
          <div className="text-muted mt-1" style={{ fontSize: ".78rem" }}>
            Share this with the user. They'll be prompted to change it on first login.
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>{submitting ? "Adding…" : "Add user"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, close, onUpdated }) {
  const notify = useToast();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    temp_password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      };
      if (form.temp_password.trim()) {
        payload.temp_password = form.temp_password.trim();
      }
      await onUpdated(user.id, payload);
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Edit — ${user.name}`} onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label>Name</label>
          <input className="search-input w-100" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-field mb-2">
          <label>Email</label>
          <input type="email" className="search-input w-100" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-6 form-field">
            <label>Role</label>
            <select className="search-input w-100" value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {roleOptions.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-6 form-field">
            <label>Status</label>
            <select className="search-input w-100" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-field mb-3">
          <label>Reset password (leave blank to keep current)</label>
          <input type="text" className="search-input w-100" value={form.temp_password}
            onChange={(e) => setForm((f) => ({ ...f, temp_password: e.target.value }))}
            placeholder="New temporary password" />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Users() {
  const notify = useToast();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getUsers().then(setUsers).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!users) return <Loading />;

  const q = search.trim().toLowerCase();
  const visible = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  );

  const addUser = async (form) => {
    const newUser = await api.addUser(form);
    setUsers((u) => u.concat([newUser]));
    notify(`${form.name} added as ${form.role}. Temporary password: ${form.temp_password}`, "success");
  };

  const updateUser = async (id, payload) => {
    const updated = await api.updateUser(id, payload);
    setUsers((us) => us.map((u) => (u.id === id ? updated : u)));
    notify("User updated.", "success");
  };

  const columns = [
    { key: "name",       label: "Name",        className: "fw-semibold py-3" },
    { key: "role",       label: "Role" },
    { key: "lastActive", label: "Last Active",  className: "text-muted" },
    { key: "status",     label: "Status",       render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "action", label: "",
      render: (row) => (
        <button
          className="btn-outline-tan px-3 py-1"
          style={{ fontSize: ".78rem" }}
          onClick={() => setEditingUser(row)}
          aria-label={`Edit ${row.name}`}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader
        title="User Management"
        icon="bi-person"
        action={
          <Button className="px-3 py-2" onClick={() => setShowAdd(true)}>
            <i className="bi bi-person-plus me-1" aria-hidden="true" />Add user
          </Button>
        }
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search users…" className="w-100 mb-3" />
      <Table columns={columns} rows={visible} emptyMessage="No users match your search." />
      {showAdd && <AddUserModal close={() => setShowAdd(false)} onAdd={addUser} />}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          close={() => setEditingUser(null)}
          onUpdated={updateUser}
        />
      )}
    </div>
  );
}
