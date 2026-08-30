using {itam as db} from '../db/schema';


@requires: [
    'RepairTechnician',
    'Admin'
]
service RepairService @(path: '/repair') {

    @odata.draft.enabled
    entity RepairRequests            as
        projection on db.RepairRequest {
            *,
            asset.inventoryNumber as assetInventoryNumber : String,
            asset.name            as assetName            : String
        }
        actions {
            action startRepair(technician: String)        returns RepairRequests;
            action completeRepair(resolutionNote: String) returns RepairRequests;
            action rejectRepair(reason: String)           returns RepairRequests;
        };

    entity RepairLogs                as projection on db.RepairLog;

    @readonly
    entity Assets                    as projection on db.Asset;

    @readonly
    entity AssetAssignments          as projection on db.AssetAssignment;

    @readonly
    entity AssetNotes                as projection on db.AssetNote;

    @readonly
    entity AssetAvailabilityStatuses as projection on db.AssetAvailabilityStatus;

    @readonly
    entity AssetRepairStatuses       as projection on db.AssetRepairStatus;

    @readonly
    entity RepairRequestStatuses     as projection on db.RepairRequestStatus;

    @readonly
    entity Priorities                as projection on db.Priority;

    @readonly
    entity Employees                 as projection on db.Employee;
}
