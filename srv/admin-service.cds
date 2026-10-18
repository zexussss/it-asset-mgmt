using {itam as db} from '../db/schema';

@requires: 'Admin'
service AdminService @(path: '/service/admin') {


    @readonly
    entity Me {
        key id         : String;
            firstName  : String;
            lastName   : String;
            email      : String;
            department : String;
    }

    @odata.draft.enabled
    entity Assets                    as projection on db.Asset;

    annotate Assets with @cds.search: {
        name,
        inventoryNumber,
        serialNumber,
        manufacturer,
        model,
        category.name,
        assignedTo.firstName,
        assignedTo.lastName
    };

    annotate RepairRequests with @cds.search: {
        description,
        technician,
        asset.inventoryNumber,
        asset.name,
        requestedBy.firstName,
        requestedBy.lastName
    };

    @odata.draft.enabled
    entity Employees                 as projection on db.Employee;

    @cds.redirection.target
    entity RepairRequests            as projection on db.RepairRequest;

    @readonly
    entity RepairLogs                as projection on db.RepairLog;
    entity AssetAssignments          as projection on db.AssetAssignment;
    entity AssetNotes                as projection on db.AssetNote;
    entity AssetCategories           as projection on db.AssetCategory;
    entity AssetAvailabilityStatuses as projection on db.AssetAvailabilityStatus;
    entity AssetRepairStatuses       as projection on db.AssetRepairStatus;
    entity Priorities                as projection on db.Priority;
    entity RepairRequestStatuses     as projection on db.RepairRequestStatus;

    @readonly
    entity TechnicianStatistics      as
        projection on db.RepairRequest {
            key ID,
                technician,
                createdDate,
                description,
                resolutionDays              @(Aggregation.default: #AVG),
                1 as requestCount : Integer @(Aggregation.default: #SUM)
        }
        where
                technician is not null
            and technician <>     '';
}
