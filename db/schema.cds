namespace itam;

using { cuid, managed } from '@sap/cds/common';

entity AssetCategory {
  key code : String(10);
      name : String(50);
}

entity AssetAvailabilityStatus {
  key code        : String(15);
      name        : String(50);
      criticality : Integer default 0;
}

entity AssetRepairStatus {
  key code        : String(15);
      name        : String(50);
      criticality : Integer default 0;
}

entity Priority {
  key code        : String(10);
      name        : String(20);
      criticality : Integer default 0;
}

entity RepairRequestStatus {
  key code        : String(10);
      name        : String(50);
      criticality : Integer default 0;
}

entity Employee : cuid {
  employeeNumber : String(20);
  firstName      : String(50);
  lastName       : String(50);
  email          : String(100);
  department     : String(50);
  assets         : Association to many Asset on assets.assignedTo = $self;
}

entity Asset : cuid, managed {
  inventoryNumber     : String(20)  @mandatory;
  name                : String(100) @mandatory;
  category            : Association to AssetCategory;

  availabilityStatus  : Association to AssetAvailabilityStatus default 'IN_STOCK';
  repairStatus        : Association to AssetRepairStatus default 'OK';

  serialNumber        : String(50);
  manufacturer        : String(50);
  model               : String(100);
  purchaseDate        : Date;
  warrantyEndDate     : Date;
  price               : Decimal(10,2);

  assignedTo          : Association to Employee;

  repairRequests    : Composition of many RepairRequest  on repairRequests.asset  = $self;
  assignmentHistory : Composition of many AssetAssignment on assignmentHistory.asset = $self;
  notes             : Composition of many AssetNote      on notes.asset          = $self;

  virtual averageRepairDays : Decimal(5,1);
}

entity AssetAssignment : cuid {
  asset        : Association to Asset;
  employee     : Association to Employee;
  assignedFrom : Date;
  returnedOn   : Date;
}

entity AssetNote : cuid, managed {
  asset    : Association to Asset;
  content  : String(1000);
  authorID : String(50);
}

entity RepairRequest : cuid, managed {
  asset          : Association to Asset;
  requestedBy    : Association to Employee;
  description    : String(1000) @mandatory;
  priority       : Association to Priority default 'MEDIUM';
  status         : Association to RepairRequestStatus default 'OPEN';
  technician     : String(100);
  createdDate    : Date;
  resolvedDate   : Date;
  resolutionDays : Integer;
  repairLogs   : Composition of many RepairLog on repairLogs.repairRequest = $self;
}

entity RepairLog : cuid {
  repairRequest : Association to RepairRequest;
  logDate       : DateTime;
  actionType    : String(30);
  technician    : String(100);
  note          : String(1000);
}
