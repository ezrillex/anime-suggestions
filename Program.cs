using System.Diagnostics;
using System.Xml;
using Microsoft.Data.Sqlite;

Stopwatch sw = new Stopwatch();

sw.Start();

// db connection closed at end of file.
var connection = new SqliteConnection("Data Source=mal.db");
connection.Open();


// create temporary table for user data.
using (var cmd = connection.CreateCommand())
{
     cmd.CommandText = @"
          create temp table user_data (
	          anime INTEGER,
   	          score INTEGER 
          );
          ";
     cmd.ExecuteNonQuery();
}


// Load user data into temporary table.
using (var transaction = connection.BeginTransaction())
{
     using (var command = connection.CreateCommand())
     {
          command.CommandText =
              @"
                         INSERT INTO user_data(score, anime)
                         VALUES($score, $anime)
                         ";

          var s = command.CreateParameter();
          var i = command.CreateParameter();
          s.ParameterName = "$score";
          i.ParameterName = "$anime";
          command.Parameters.Add(s);
          command.Parameters.Add(i);

          // load user xml
          XmlDocument doc = new XmlDocument();
          doc.PreserveWhitespace = false;
          doc.Load("mal.xml");
          doc.DocumentElement.RemoveChild(doc.DocumentElement.FirstChild);

          // Insert a lot of data
          foreach (XmlNode node in doc.DocumentElement.ChildNodes)
          {
               s.Value = int.Parse(node["my_score"].InnerText);
               i.Value = int.Parse(node["series_animedb_id"].InnerText);
               command.ExecuteNonQuery();
          }
          Console.WriteLine("User records loaded into database");

     }
     transaction.Commit();
}


// Do the big query

using (var command = connection.CreateCommand())
{
     command.CommandText =
          @"
SELECT anime,
       round(avg(score), 2) average
  FROM scores
 WHERE user IN (
           SELECT user
             FROM(
                      SELECT *,
                             (10 - diff) AS linear
                        FROM (
                                 SELECT s.rowid,
                                        s.*,
                                        u.score AS my_score,
                                        iif(u.score == 0 OR 
                                            s.score == 0, NULL, abs(u.score - s.score) ) AS diff
                                   FROM scores AS s
                                        LEFT JOIN
                                        temp.user_data AS u ON u.anime = s.anime
                             )
                             AS subcalc
                  )
            GROUP BY user
            ORDER BY sum(linear) DESC
            LIMIT 2830-- 283,045 users * 1% = 2830 aprox. TOP 1&
       )
AND 
       anime NOT IN (
           SELECT anime
             FROM temp.user_data
       )
 GROUP BY anime
 ORDER BY average DESC
 LIMIT 100;

";
     Console.WriteLine("Calculating Recommendations...");
     using (var read = command.ExecuteReader()){
          while (read.Read()){
               Console.WriteLine($"{read.GetFloat(1)}  https://myanimelist.net/anime/{read.GetInt32(0)}");
          }
     }
    

    

     

}
   







connection.Close();
connection.Dispose();

sw.Stop();

Console.WriteLine("Elapsed={0}", sw.Elapsed);
Console.WriteLine("Press enter to exit");
Console.ReadLine();

