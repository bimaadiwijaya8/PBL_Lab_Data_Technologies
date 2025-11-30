# Database Setup Guide for Laragon with PostgreSQL

This guide explains how to set up PostgreSQL with PDO in Laragon on Windows.

## Prerequisites
- Laragon installed
- PostgreSQL installed (either separately or via Laragon's package manager)

## Common Issue: PDO_PGSQL Driver Not Found

### Error Message:
```
PDO_PGSQL: ❌ Not Loaded
Connection failed: could not find driver
```

## Solution

### 1. Enable PDO_PGSQL Extension in PHP

1. Open Laragon's PHP configuration:
   - Click on the Laragon icon in the system tray
   - Navigate to: `PHP > php.ini` (this will open the configuration file in your default editor)

2. Find and uncomment the PostgreSQL PDO extension line:
   ```ini
   ;extension=pdo_pgsql
   ```
   Change it to:
   ```ini
   extension=pdo_pgsql
   ```

3. Save the file and restart Laragon:
   - Right-click the Laragon icon in the system tray
   - Click "Restart All"

### 2. Verify PostgreSQL Service is Running

1. Open Laragon
2. Click on "Start All" if not already started
3. Ensure PostgreSQL service is running (should show as green)

### 3. Verify Installation (Optional)

Create a `phpinfo.php` file in your web root with:
```php
<?php phpinfo();
```

Access it via: `http://localhost/phpinfo.php` and search for "pdo_pgsql" to verify it's enabled.

## Troubleshooting

### If the extension is still not loaded:

1. **Check PHP Version**:
   - Ensure you're editing the correct `php.ini` file for your PHP version
   - Laragon might have multiple PHP versions installed

2. **Check Extension Directory**:
   In your `php.ini`, verify the `extension_dir` points to the correct directory:
   ```ini
   extension_dir = "C:\\laragon\\bin\\php\\php-[version]\\ext"
   ```
   (Replace `[version]` with your PHP version)

3. **Check PostgreSQL Installation**:
   - Ensure PostgreSQL is properly installed
   - The `libpq.dll` should be in your system PATH

4. **Check PHP Error Logs**:
   - Laragon menu > PHP > Error Log
   - Look for any PDO or PostgreSQL related errors

## Final Test

After making these changes, test your connection again:
```
http://localhost/your-project/test_connection_standalone.php
```

You should see a success message with database connection details.

## Additional Notes

- Always backup your `php.ini` before making changes
- If using version control, consider adding a `.gitignore` entry for configuration files with sensitive information
- For production, use environment variables instead of hardcoding database credentials

## Common Errors and Solutions

1. **"Specified driver could not be found"**
   - The PDO_PGSQL extension is not properly installed or enabled
   - Verify the extension file exists in the PHP extensions directory

2. **Connection refused**
   - PostgreSQL service is not running
   - Check if PostgreSQL is running in Laragon
   - Verify the port number in your connection settings

3. **Authentication failed**
   - Double-check your database username and password
   - Verify PostgreSQL's `pg_hba.conf` file has the correct authentication settings

## Need Help?
If you're still experiencing issues, please provide:
1. The exact error message
2. Your PHP version
3. PostgreSQL version
4. Contents of your `php.ini` (relevant sections)
5. Any error logs from PHP or PostgreSQL
