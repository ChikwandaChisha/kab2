# Role-Based Access Control (RBAC) Matrix

## User Roles

| Role | Description |
|------|-------------|
| User | Regular platform members who can send and receive messages |
| Moderator | Content oversight personnel with review and restriction capabilities |
| Admin | System administrators with full management access |

## Complete Permission Matrix

| Action/Resource | User | Moderator | Admin |
|-----------------|------|-----------|--------|
| Authentication & Profile | | | |
| Login/Logout | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| Messaging | | | |
| Send Message | ✅ | ✅ | ✅ |
| Receive Message | ✅ | ✅ | ✅ |
| Decrypt Own Messages | ✅ | ✅ | ✅ |
| View Message Inbox | ✅ | ✅ | ✅ |
| Content Moderation | | | |
| Flag Message | ✅ | ✅ | ✅ |
| View Flagged Messages | ❌ | ✅ | ✅ |
| Review Flagged Content | ❌ | ✅ | ✅ |
| Approve/Dismiss Flags | ❌ | ✅ | ✅ |
| Create Messaging Restrictions | ❌ | ✅ | ✅ |
| Freeze Tokens | ❌ | ✅ | ✅ |
| Access Mod Panel | ❌ | ✅ | ✅ |
| User Management | | | |
| View All Users | ❌ | ❌ | ✅ |
| Manage User Roles | ❌ | ❌ | ✅ |
| Suspend/Activate Users | ❌ | ❌ | ✅ |
| Access Admin Console | ❌ | ❌ | ✅ |
| Audit & Logging | | | |
| View Own Activity Logs | ✅ | ✅ | ✅ |
| View Moderation Logs | ❌ | ✅ | ✅ |
| View Full Audit Logs | ❌ | ❌ | ✅ |
| System Configuration | | | |
| Manage System Settings | ❌ | ❌ | ✅ |
| Rotate System Keys | ❌ | ❌ | ✅ |
| Configure Policies | ❌ | ❌ | ✅ |

## Navigation Access Control

| Page/Route | User | Moderator | Admin |
|------------|------|-----------|--------|
| /messages | ✅ | ✅ | ✅ |
| /send | ✅ | ✅ | ✅ |
| /mod-panel | ❌ | ✅ | ✅ |
| /admin-console | ❌ | ❌ | ✅ |

Note: Moderators are automatically redirected to /mod-panel upon login, but can still access messaging pages if navigated to directly.

## Database-Level Access Control (RLS Policies)

| Table | User Access | Moderator Access | Admin Access |
|-------|-------------|------------------|--------------|
| messages | Own messages only | Own + flagged messages | All messages |
| flagged_messages | Own flags only | All flagged messages | All flagged messages |
| profiles | Own profile only | Own profile only | All profiles |
| audit_logs | No direct access | Limited access (own actions) | Full access |
| messaging_restrictions | No access | Can create/view | Full access |
| user_bans | No access | Can view | Full access |
| sender_flag_counts | No access | Can view/update | Full access |

## Threat Model

### 1. Authentication Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|---------|------------|------------|
| Brute Force | High | Medium | Rate limiting, MFA |
| Session Hijacking | High | Low | Secure session management |
| Credential Theft | High | Medium | Password policies, MFA |

### 2. Authorization Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|---------|------------|------------|
| Role Escalation | High | Low | RBAC, RLS policies |
| Unauthorized Access | High | Medium | Access controls, audit logging |
| Privilege Abuse | High | Low | Activity monitoring |

### 3. Data Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|---------|------------|------------|
| Message Interception | High | Low | E2E encryption |
| Data Leakage | High | Medium | Encryption, access controls |
| Data Tampering | High | Low | Audit logging, integrity checks |

### 4. Application Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|---------|------------|------------|
| XSS | Medium | Medium | Input validation, CSP |
| CSRF | Medium | Low | CSRF tokens |
| SQL Injection | High | Low | Parameterized queries |

## Security Controls

### 1. Preventive Controls
- End-to-end encryption
- Role-based access control
- Input validation
- Secure session management
- Password policies

### 2. Detective Controls
- Audit logging
- Activity monitoring
- Alert system
- Log analysis

### 3. Corrective Controls
- Incident response plan
- Backup and recovery
- System updates
- Security patches

## Risk Assessment

### High Risk
- Unauthorized access to messages
- System compromise
- Data breach

### Medium Risk
- Service disruption
- Data corruption
- Privacy violation

### Low Risk
- UI/UX issues
- Performance degradation
- Minor bugs 